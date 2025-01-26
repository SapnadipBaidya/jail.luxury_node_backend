const productService = require("../service/productService");

async function findAllProductsByCatagoryId(FilterObj) {
  return await productService.findAllProductsByCatagoryId(FilterObj);
}

async function findProductsByPdId(FilterObj) {
    let responseData = await productService.findProductsByPdId(FilterObj);

    if (!Array.isArray(responseData) || responseData.length === 0) {
        console.log("⚠️ No data found!");
        return {
            data: [],
            processedData: {
                allSizesIdOfProduct: [],
                allColorsIdOfProduct: [],
            },
        };
    }

    const allSizesIdOfProduct = new Map();
    const allColorsIdOfProduct = new Map();

    // ✅ Use for...of loop (More Efficient)
    for (const currentValue of responseData) {
        if (currentValue?.color_details?.color_id) {
            allColorsIdOfProduct.set(
                currentValue.color_details.color_id,
                currentValue.color_details
            );
        }

        if (currentValue?.size_details?.pkSizeId) {
            allSizesIdOfProduct.set(
                currentValue.size_details.pkSizeId,
                currentValue.size_details
            );
        }
    }

    // ✅ Convert Maps to Sorted Arrays of Objects
    const sortedColors = [...allColorsIdOfProduct.entries()]
        .sort(([a], [b]) => a - b)
        .map(([id, details]) => ({ id, details }));

    const sortedSizes = [...allSizesIdOfProduct.entries()]
        .sort(([a], [b]) => a - b)
        .map(([id, details]) => ({ id, details }));

    const processedData = {
        allSizesIdOfProduct: sortedSizes,
        allColorsIdOfProduct: sortedColors
    };

    console.log("✅ Processed Data:", processedData);

    return {
        data: responseData,
        processedData,
    };
}

async function findAllProductsByCatagoryId(FilterObj){
    return await productService.findAllProductsByCatagoryId(FilterObj);
}

async function findAllAvalibaleSizesByPidAndColorId(FilterObj){
    return await productService.findAllAvalibaleSizesByPidAndColorId(FilterObj);
}

async function findAllAvalibaleColorsByPidAndSizeId(FilterObj){
    return await productService.findAllAvalibaleColorsByPidAndSizeId(FilterObj);
}
module.exports = { findAllProductsByCatagoryId, findProductsByPdId ,findAllAvalibaleColorsByPidAndSizeId , findAllAvalibaleSizesByPidAndColorId};
