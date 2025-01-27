const sequelize = require("../config/connection");

// Function to classify user search terms dynamically
async function classifySearchTerms(userInput) {
    const words = userInput.trim().toLowerCase().split(' ');

    let colorTerm = '';
    let productTerm = '';
    let categoryTerm = '';

    // Fetch colors and categories from database using raw SQL
    const [colorRows] = await sequelize.query("SELECT color_name FROM product_colors");
    const [categoryRows] = await sequelize.query("SELECT catagory_name FROM product_catagory");

    const colorList = colorRows.map(row => row.color_name.toLowerCase());
    const categoryList = categoryRows.map(row => row.catagory_name.toLowerCase());

    words.forEach(word => {
        console.log("colorList",colorList,"categoryList",categoryList,"word",word);
        if (colorList.find(color => color.includes(word))) {
            colorTerm = word;
        } else if (categoryList.find(category => category.includes(word))) {
            categoryTerm = word;
        } else {
            productTerm =word;
        }
    });
    console.log( "colorTerm",colorTerm, "productTerm",productTerm, "categoryTerm",categoryTerm);
    return { colorTerm, productTerm, categoryTerm };
}

// Search API Route
async function searchByNameColorCategory({userInput}){
    try {
        const { colorTerm, productTerm, categoryTerm } = await classifySearchTerms(userInput || '');

        const sqlQuery = `
            SELECT 
                p.product_id, 
                p.product_name, 
                p.description, 
                pc.catagory_name, 
                col.color_name, 
                col.color_hex, 
                MAX(pd.quantity) AS quantity,  
                MAX(pd.in_stock) AS in_stock,  
                p.product_price_local, 
                p.product_price_global, 
                p.local_currency, 
                p.global_currency
            FROM products p
            JOIN product_catagory pc ON p.fk_category_id = pc.catagory_id
            JOIN products_details pd ON p.product_id = pd.fk_product_id
            JOIN product_colors col ON pd.fk_color_id = col.pk_color_id
            WHERE 
                p.product_name LIKE CONCAT('%', :productTerm, '%') 
                AND col.color_name LIKE CONCAT('%', :colorTerm, '%') 
                AND pc.catagory_name LIKE CONCAT('%', :categoryTerm, '%') 
            GROUP BY p.product_id, col.color_name, pc.catagory_name, p.product_name, p.description, 
                    col.color_hex, p.product_price_local, p.product_price_global, 
                    p.local_currency, p.global_currency
            ORDER BY p.product_name;
        `;

        const [results] = await sequelize.query(sqlQuery, {
            replacements: { productTerm, colorTerm, categoryTerm }
        });
        return results?.length > 0 ? results : "Nothing Found"
    } catch (error) {
        console.error('Error:', error);
        return []
    } 
};

module.exports = {searchByNameColorCategory};
