    let parent = require('./../../add-new-products');
    let fs = require('fs'), requestToImage = require('request');

    let countQuery;
    let options = [];
    let currentNumberOfSegments = 0;
    let prod_id = 0;
    let dataMap = new Map();
    let mapOptionDesc = new Map();
    let mapManufactoriesDesc = new Map();
    let mapVarianteToProducts = new Map();
    let lastProductId;
    let model;
    let ean;
    let quantity;
    let stock_status_id;
    let manufactoryId;
    let countUpdate = 0;
    let currentNumberOfUpdateSize = 0;
    let currentRelatedUpdateNumber = 0;
    let currentRelatedUpdateNumberSecond = 0;
    let downloadingCategory = 87; // Important!!! Set category id before download

    let pathImage;
    let image;
    let metaH1;
    let metaTitle;
    let seo;
    let numberTableSizeToProduct;
    let arrOthersImage = [];
    let arrPathImages = [];

    function downloadDataNewProductsFromWebSite(http,connection){
        console.log("Start: ");
        
//        for (let j =0; j < parent.newProducts.length; j++){
//            console.log("newProducts[j].id: " + parent.newProducts[j].product_id + "; newProducts[j].name: " + parent.newProducts[j].name + ";  newProducts[j].path: " + parent.newProducts[j].path);
//        }
        lastProductId = parent.lastProductIdStatic;
        getOptionDescr(http,connection);
        console.log("connection close!");
    }

    function getOptionDescr(http,connection){
        
        connection.query('SELECT option_value_id, name from oc_option_value_description', function(err, rows, fields) {
          if (!err){
            if (rows.length == 0) {
                    console.log("Don`t find results in query to mySql!");
            }else{

                    for (var i = 0; i < rows.length; i++ ){
                        mapOptionDesc.set(rows[i].name, rows[i].option_value_id);
                    }
                    
                    getManufactoriesDesc(http,connection);
            }
          }
          else
            console.log('Error while performing Query 2.');
        });
    }

    function getManufactoriesDesc(http,connection){
         connection.query('SELECT manufacturer_id, name from oc_manufacturer', function(err, rows, fields) {
          if (!err){
            if (rows.length == 0) {
                    console.log("Don`t find results in query to mySql!");
            }else{

                    for (var i = 0; i < rows.length; i++ ){
                        mapManufactoriesDesc.set(rows[i].name, rows[i].manufacturer_id);
                    }
                    
                    getVarianteToProduct(connection);
            }
          }
          else
            console.log('Error while performing Query 2.');
        });
    }

    function getVarianteToProduct(connection){
         connection.query('SELECT product_id, related_id from oc_related_variant_to_product', function(err, rows, fields) {
          if (!err){
            if (rows.length == 0) {
                    console.log("Don`t find results in query to mySql oc_related_variant_to_product!");
            }else{

                    for (var i = 0; i < rows.length; i++ ){
                        mapVarianteToProducts.set(rows[i].product_id,rows[i].related_id);
                    }
                    
                    createOptionsToDownload(connection);
            }
          }
          else
            console.log('Error while performing Query oc_related_variant_to_product.');
        });
    }

    function createOptionsToDownload(connection){

        countQuery = parent.newProducts.length / 1;
        options = [];

        var agent = new parent.http.Agent({

            keepAlive: true,
            keepAliveMsecs: 50,
            maxSockets: 3,
            maxFreeSockets: 3

        });

        countQuery =  parent.newProducts.length;
//
//        module.exports.countQuery = countQuery;
//        module.exports.countUpdate = countUpdate;
//        module.exports.connection = connection;
//        module.exports.arrData = arrData;
//        module.exports.arrJan = arrJan;

        downloadSegm( currentNumberOfSegments,connection );
    }

    function downloadSegm( currentNumberOfSegments, connection ){
          dataMap.clear(); 

          if ( currentNumberOfSegments < parent.newProducts.length ){ 

                    let hostValidated = validateOptionsHost(parent.newProducts[currentNumberOfSegments].host);
                    let valPath = validateOptionsPath(parent.newProducts[currentNumberOfSegments].path);
                    option = {
                        host: hostValidated,
                        path: valPath,
                        product_id: parent.newProducts[currentNumberOfSegments].product_id
                    };        
           }
    
    
            console.log("option data: " + option.host + option.path + " product_id: " + option.product_id);

            if ( option.host == "ua.sportsdirect.com"){
                    downloadDataFromWebSite( option, parent.http, connection );
            }else if ( option.host == "s-group.org.ua" ){
//                    downloadDataFromWebSiteSGroup( option, parent.http );
            }else{
                console.log("Error!!! Not find host name: " + option.host);
//                downloadDataFromWebSite( option, parent.http );
            }
    }

    function downloadDataFromWebSite(option, http, connection){
          
          request = http.request(option, callbackData);
              
          function callbackData(res) {

              var data = '';
              
              res.on('data', function (chunk) {
                data += chunk;
              });

              res.on('end', function () {
                  
                var regularExpPath = /<form\smethod="post"\saction="(.*?)"\sid="Form"\senctype="/
                var resultPath = regularExpPath.exec(data);  
                  
                if ( resultPath ){
                    resultPath = resultPath[1];
//                    console.log("Path :" + resultPath);
                }else{
                    resultPath = null;
                }
                
                var regularExpNotFound = /<h1>\s(.*?)\s<\/h1>/
                var resultNotFound = regularExpNotFound.exec(data);  
                  
                if ( resultNotFound != null){
                    if ( resultNotFound[1] == "ERROR 404"  || resultNotFound[1] == "Доступ запрещен"){
                        console.log("Warning: " + resultNotFound[1] + " - " + resultPath);
                        resultNotFound = true;

                    }else{
                        resultNotFound = false;
                        mapTmp.push( resultPath );

                    }
                }  
                  
//                if (map.has(resultPath)){
//                    mapTmp.push( resultPath );
//                }
                  
                if ( !resultNotFound ){
                    lastProductId++;
                }
                  
                model = lastProductId;
                  
                ean = "ua.sportsdirect.com";
                  
                quantity = 50;
                  
                stock_status_id = 7;
                  
//                let regularExpDiscount =/<span\sid="dnn_ctr\d+_ViewTemplate_ctl00_ctl05_lblSellingPrice"\sclass="\sproductHasRef">(.*?)\s€<\/span>/
//                let resultDiscount = regularExpDiscount.exec(data);
//
//                if ( resultDiscount ){
//                    resultDiscount = resultDiscount[1].replace(/\s/g, '');
//                    resultDiscount = resultDiscount.replace(/,/, ".");
//                    resultDiscount = parseFloat( resultDiscount );
//                    console.log("resultDiscount: " + resultDiscount);
//                }else{
//                    resultDiscount = null;
//                }  
//				  
//                var regularExpPrice = /<span\sid="dnn_ctr\d+_ViewTemplate_ctl00_ctl06_lblTicketPrice">(.*?)\s€<\/span>/
//                var resultPrice = regularExpPrice.exec(data);
//
//                if ( resultPrice ){
//                    resultPrice = resultPrice[1].replace(/\s/g, '');
//                    resultPrice = resultPrice.replace(/,/, ".");
//                    resultPrice = parseFloat( resultPrice );
//                    console.log("price: " + resultPrice);
//                }else{
//                    resultPrice = null;
//                }
                  
                  
                let regularExpDiscount =/<span\sid="dnn_ctr\d+_ViewTemplate_ctl00_ctl0\d_lblSellingPrice"\sclass="\sproductHasRef">(.*?)\s€<\/span>/
                let resultDiscount = regularExpDiscount.exec(data);

                if ( resultDiscount ){
                    resultDiscount = resultDiscount[1].replace(/\s/g, '');
                    resultDiscount = resultDiscount.replace(/,/, ".");
                    resultDiscount = parseFloat( resultDiscount );
//                    console.log("resultDiscount: " + resultDiscount);
                }else{
                    resultDiscount = null;
                }  
				  
                let regularExpPrice;
                
                regularExpPrice = /<span\sid="dnn_ctr\d+_ViewTemplate_ctl00_ctl0\d_lblTicketPrice">(.*?)\s€<\/span>/;
				  
                let resultPrice = regularExpPrice.exec(data);

                if ( resultPrice ){
                    resultPrice = resultPrice[1].replace(/\s/g, '');
                    resultPrice = resultPrice.replace(/,/, ".");
                    resultPrice = parseFloat( resultPrice );
//                    console.log("price: " + resultPrice);
                }else{
                    resultPrice = null;
                }
                  
                  
                if (/data-popuptitle=".*?-\s(.*?)\s€"\sdata-popuphref/.test(data)){
                    let regularExpPrice1 = /data-popuptitle=".*?-\s(.*?)\s€"\sdata-popuphref/;
                    
                    let resultPrice1 = regularExpPrice1.exec(data);

                    if ( resultPrice1 ){
                        resultPrice1 = resultPrice1[1].replace(/\s/g, '');
                        resultPrice1 = resultPrice1.replace(/,/, ".");
                        resultPrice1 = parseFloat( resultPrice1 );
    //                  
                        if ( resultPrice != null && resultPrice1 > resultPrice){
                            resultPrice = resultPrice1;
                        }else if ( resultPrice != null && resultPrice1 <= resultPrice){
                            
                        }else{
                            resultPrice = resultPrice1;
                        }
                    }else{
                        resultPrice = null;
                    }
                }
                  
                  
                if ( resultDiscount == resultPrice){
                    resultDiscount = null;
                }
                  
                let regularExpProductCode = /colcode=(.*?)"\sid="Form"/
				  
                let resultProductCode = regularExpProductCode.exec(data);

                if ( resultProductCode ){
                    resultProductCode = resultProductCode[1].replace(/\s/g, '');
                    console.log("resultProductCode: " + resultProductCode);
                }else{
                    resultProductCode = null;
                }
                  
                  // end add new code
                  
                  
                
                  
                if ( resultDiscount == resultPrice){
                    resultDiscount = null;
                }
                                  
                var regularExpManufactory = /<a\sclass="MoreFromLink"\shref=.*>(.*?)<\/a>/
                var resultManufactory = regularExpManufactory.exec(data);
                manufactoryId = 0;
                  
                if ( resultManufactory ){
                    resultManufactory = resultManufactory[1];
                    console.log("resultManufactory: " + resultManufactory + ";");
                    manufactoryId = mapManufactoriesDesc.get(resultManufactory);
                }else{
                    resultManufactory = null;
                    manufactoryId = false;
                }
                  
                if ( manufactoryId ){
//                        console.log("manufactoryId: " + manufactoryId);
                }else{
                        console.log("Warning manufactoryId unknown!!: " + manufactoryId);
                        manufactoryId = 372;
                }
                  
                if ( downloadingCategory == 66 ){ 
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/ladies/shoes/canvas/";
                    metaTitle = "Купить женские кеды ";
                    metaH1 = "Кеды женские ";
                    numberTableSizeToProduct = 1;
                }else if ( downloadingCategory == 69 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/ladies/shoes/Sandals-Flip-Flops/";
                    metaTitle = "Купить женские сандали ";
					metaH1 = "Сандали женские ";
                    seo = "woman-sandali-";
                    numberTableSizeToProduct = 1;
                }else if ( downloadingCategory == 67 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/ladies/shoes/boots/";
                    metaTitle = "Купить ботинки женские ";
                    metaH1 = "Женские ботинки";
                    seo = "woman-boots-";
                    numberTableSizeToProduct = 1;
                }else if ( downloadingCategory == 91 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/ladies/shoes/Trainers/";
                    metaTitle = "Купить женские кроссовки ";
                    metaH1 = "Кроссовки женские ";
                    seo = "woman-krossovki-";
                    numberTableSizeToProduct = 1;
                }else if ( downloadingCategory == 90 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/ladies/shoes/shoes/";
                    metaTitle = "Купить женские туфли ";
					metaH1 = "Туфли женские ";
                    seo = "woman-shoes-";
                    numberTableSizeToProduct = 1;
                }else if ( downloadingCategory == 68 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/ladies/shoes/wellies/";
                    metaTitle = "Купить женские резиновые сапоги ";
                    seo = "woman-rezina-sapogi-";
                    numberTableSizeToProduct = 1;
                }else if ( downloadingCategory == 89 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/mens/shoes/slips/";
                    metaTitle = "Купить мужские сандали ";
                    numberTableSizeToProduct = 2;
                }else if ( downloadingCategory == 86 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/mens/shoes/boots/";
                    metaTitle = "Купить мужские ботинки ";
                    metaH1 = "Ботинки мужские ";
					seo = "mens-boots-";
                    numberTableSizeToProduct = 2;
                }else if ( downloadingCategory == 88 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/mens/shoes/canvas/";
                    metaTitle = "Купить мужские кеды ";
                    metaH1 = "Кеды мужские ";
					seo = "mens-canvas-";
                    numberTableSizeToProduct = 2;
                }else if ( downloadingCategory == 87 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/mens/shoes/trainers/";
                    metaTitle = "Купить мужские кроссовки ";
					metaH1 = "Мужские кроссовки ";
					seo = "mens-krossovki-";
                    numberTableSizeToProduct = 2;
                }else if ( downloadingCategory == 83 ){
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/mens/shoes/shoes/";
                    metaTitle = "Купить мужские туфли ";
					metaH1 = "Туфли мужские ";
					seo = "mens-shoes-";
                    numberTableSizeToProduct = 2;
                }else{
                    pathImage = "C:/OpenServer/domains/nun/image/catalog/products/others/";
                    console.log("Warning - не знайдено папку категорії для картинок!!!");
                    numberTableSizeToProduct = 0;
                }
                  
                if (!fs.existsSync(pathImage)){
                    fs.mkdirSync(pathImage);
                }
                                                      
                let regularExpName = /<span\sid="ProductName"><!--\smp_trans_rt_start\sid="1"\sargs="as"\s3\s-->(.*?)<!--\smp_trans_rt_end\s3--><\/span>/
                let resultName = regularExpName.exec(data);
                  
                if ( resultName ){
                    pathImage = pathImage + resultName[1].replace(/\s/g, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");

                    if (!fs.existsSync(pathImage)){
                        fs.mkdirSync(pathImage);
                    }
                }  
                
                if ( resultName ){
                    parent.arrRelatet.push({
                        product_id: lastProductId,
                        name: resultName[1]
                    });
                }
                  
                let regularExpColour = /<span\sid="dnn_ctr\d*_ViewTemplate_ctl00_ctl0\d_colourName">(.*)<\/span>/
                let resultColour = regularExpColour.exec(data);
                  
                if ( resultName && resultColour ){
                    resultColour = resultColour[1].replace(/\//, "-");
                    resultColour = resultColour.replace(/\//, "-");
                    resultColour = resultColour.replace(/\//, "-");
                    resultColour = resultColour.replace(/\//, "-");
//                    resultColour = resultColour.replace(/ /, "-");
//                    resultColour = resultColour.replace(/ /, "-");
                    resultNameToImage = resultName[1] + "-" + resultColour;
                    resultName = resultName[1] + " " + resultColour;
                    seo = seo + resultName.replace(/\//g, "-");
                    seo = seo.replace(/\//, "-");
                    seo = seo.replace(/\//, "-");
                    seo = seo.replace(/\//, "-");
                    seo = seo.replace(/\//, "-");
                    seo = seo.replace(/\//, "-");
                    seo = seo.replace(/ /g, "-");
                    seo = seo.replace(/ /, "-");
                    seo = seo.replace(/ /, "-");
                    seo = seo.replace(/ /, "-");
                    seo = seo.replace(/ /, "-");
                    seo = seo.replace(/ /, "-");
                    console.log("resultName: " + resultName);
                    console.log("resultColour: " + resultColour);
                }else{
                    resultName = null;
                    resultColour = null;
                    seo = null;
                }
                  
                metaTitle = metaTitle + resultName;
                
                if ( resultName ){

                    pathImage = pathImage + "/"+ resultNameToImage.replace(/\s/, "-");

                    resultNameToImage = resultNameToImage.replace(/\s/g, "-");
                 
                    resultNameToImage = resultNameToImage.replace(/ /g, "-");
         
                    pathImage = pathImage.replace(/ /g, "-");
                    pathImage = pathImage.replace(/ /, "-");
                    pathImage = pathImage.replace(/ /, "-");
                    pathImage = pathImage.replace(/ /, "-");
          
                    pathImage = pathImage.replace(/\s/g, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");
                    pathImage = pathImage.replace(/\s/, "-");

                    if (!fs.existsSync(pathImage)){
                        fs.mkdirSync(pathImage);
                    }

                    pathImage = pathImage + "/" + resultNameToImage.replace(/\s/g, "-");

                    pathImage = pathImage.replace(/\s/g, "-");
                    pathImage = pathImage.replace(/\s/, "-");

                }
                  
                var regularExpImage = /<div\sid="productRollOverPanel"\sclass="easyzoom">\s+?<img\ssrc="(.*?)"\sid="/
                var resultImage = regularExpImage.exec(data);

                if ( resultImage ){
                    resultImage = resultImage[1];
                    console.log("resultImage: " + resultImage);
                }else{
                    resultImage = null;
                }
                  
                  
                let othersImage;
                othersImage = data.match(/srczoom="(.*?)">/g);
                arrOthersImage = [];
                arrPathImages = [];
                let formatImages;
                
                if ( othersImage != null ){
                    for ( let i = 0; i < othersImage.length; i++ ){
                        let tmp = othersImage[i].replace(/srczoom="/, "");
                        tmp = tmp.replace(/">/, "");

                        arrOthersImage.push(tmp);

                        if ( /\.jpg/.test(tmp) ){
                            formatImages = ".jpg";
                        }else if( /\.png/.test(tmp) ){
                            formatImages = ".png";
                        }else if ( /\.jpeg/.test(tmp) ){
                            formatImages = ".jpeg";
                        }else{
                            formatImages = ".jpg";
                        }

                        arrPathImages.push(pathImage.replace(/C:\/OpenServer\/domains\/nun\/image\//, "") + "_" + i + formatImages);
                        console.log("pathImage: " +  pathImage.replace(/C:\/OpenServer\/domains\/nun\/image\//, "") + "_" + i + formatImages);

                        if ( i != 0 && resultPrice ){
                            downloadImage(tmp, pathImage + "_" + i + formatImages, function(){
                              console.log('done');
                            });
                        }else{
                        }
                    }
                }
                
                  
                if ( /\.jpg/.test(arrOthersImage[0]) ){
                    formatImages = ".jpg";
                }else if( /\.png/.test(arrOthersImage[0]) ){
                    formatImages = ".png";
                }else if ( /\.jpeg/.test(arrOthersImage[0]) ){
                    formatImages = ".jpeg";
                }else{
                    formatImages = ".jpg";
                }
                  
                resultImage = arrOthersImage[0];  
            
                if ( resultName && resultPrice ){
                    
                    downloadImage(resultImage, pathImage + formatImages, function(){
                      console.log('done');
                    });
//                    image = pathImage.replace(/C:\/OpenServer\/domains\/nun\/image\//, "");
                    image = pathImage.replace(/C:\/OpenServer\/domains\/nun\/image\//, "") + formatImages;

                }else{
                    image = null;
                }
                  
                let filterColourName;
                  
                if (resultColour){
                    if ( /Wht/.test(resultColour.substr(0,resultColour.indexOf('-'))) || /White/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Белый";  
                    }else if (/Black/.test(resultColour.substr(0,resultColour.indexOf('-'))) || /Blk/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Черный";
                    }else if (/Anthracite/.test(resultColour.substr(0,resultColour.indexOf('-'))) || /Anthracit/.test(resultColour.substr(0,resultColour.indexOf('-'))) || /Anthrac/.test(resultColour.substr(0,resultColour.indexOf('-'))) || /Anthr/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Антрацит";
                    }else if (/Aqua/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Аква";
                    }else if (/Beige/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Бежевый";
                    }else if (/Blue/.test(resultColour.substr(0,resultColour.indexOf('-'))) || /Blu/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Синий";
                    }else if (/Bordo/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Бордовый";
                    }else if (/Bronze/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Бронза";
                    }else if (/Brown/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Коричневый";
                    }else if (/Burgundy/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Бургундское вино";
                    }else if (/Camel/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Желтовато-коричневый";
                    }else if (/Charcoal/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Древесный уголь";
                    }else if (/Chocolate/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Шоколадный";
                    }else if (/Coral/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Коралловый";
                    }else if (/Cyan/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Голубой";
                    }else if (/Denim/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Джинсовый";
                    }else if (/Fuchsia/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Фуксия";
                    }else if (/Gold/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Золотой";
                    }else if (/Green/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Зеленый";
                    }else if (/Grey/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Серый";
                    }else if (/Honey/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Медовый";
                    }else if (/Ivory/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Слоновая кость";
                    }else if (/Khaki/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Хаки";
                    }else if (/Leather/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Кожа";
                    }else if (/Lemon/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Лимонный";
                    }else if (/Maroon/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Каштановый";
                    }else if (/Mint/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Мятный";
                    }else if (/Multi/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Разноцветный";
                    }else if (/Navy/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Темно-синий";
                    }else if (/Olive/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Оливковый";
                    }else if (/Orange/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Оранжевый";
                    }else if (/Orchid/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Орхидея";
                    }else if (/Pewter/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Оловянный";
                    }else if (/Pink/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Розовый";
                    }else if (/Plum/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Сливовый";
                    }else if (/Poppy/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Маковый";
                    }else if (/Purple/.test(resultColour.substr(0,resultColour.indexOf('-'))) || /Purp/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Фиолетовый";
                    }else if (/Red/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Красный";
                    }else if (/Rose/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Розовый";
                    }else if (/Royal/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Королевский синий";
                    }else if (/Sand/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Песочный";
                    }else if (/Silver/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Серебряный";
                    }else if (/Tan/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Желтовато-коричневый";
                    }else if (/Taupe/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Темно-серый";
                    }else if (/Violet/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Фиолетовый";
                    }else if (/Yellow/.test(resultColour.substr(0,resultColour.indexOf('-')))){
                        filterColourName = "Желтый";
                    }else if (/Black/.test(resultColour) || /Blk/.test(resultColour)){
                        filterColourName = "Черный";
                    }else if (/Anthracite/.test(resultColour) || /Anthracit/.test(resultColour) || /Anthrac/.test(resultColour) || /Anthr/.test(resultColour)){
                        filterColourName = "Антрацит";
                    }else if (/Aqua/.test(resultColour)){
                        filterColourName = "Аква";
                    }else if (/Beige/.test(resultColour)){
                        filterColourName = "Бежевый";
                    }else if (/Blue/.test(resultColour) || /Blu/.test(resultColour)){
                        filterColourName = "Синий";
                    }else if (/Bordo/.test(resultColour)){
                        filterColourName = "Бордовый";
                    }else if (/Bronze/.test(resultColour)){
                        filterColourName = "Бронза";
                    }else if (/Brown/.test(resultColour)){
                        filterColourName = "Коричневый";
                    }else if (/Burgundy/.test(resultColour)){
                        filterColourName = "Бургундское вино";
                    }else if (/Camel/.test(resultColour)){
                        filterColourName = "Желтовато-коричневый";
                    }else if (/Charcoal/.test(resultColour)){
                        filterColourName = "Древесный уголь";
                    }else if (/Chocolate/.test(resultColour)){
                        filterColourName = "Шоколадный";
                    }else if (/Coral/.test(resultColour)){
                        filterColourName = "Коралловый";
                    }else if (/Cyan/.test(resultColour)){
                        filterColourName = "Голубой";
                    }else if (/Denim/.test(resultColour)){
                        filterColourName = "Джинсовый";
                    }else if (/Fuchsia/.test(resultColour)){
                        filterColourName = "Фуксия";
                    }else if (/Gold/.test(resultColour)){
                        filterColourName = "Золотой";
                    }else if (/Green/.test(resultColour)){
                        filterColourName = "Зеленый";
                    }else if (/Grey/.test(resultColour)){
                        filterColourName = "Серый";
                    }else if (/Honey/.test(resultColour)){
                        filterColourName = "Медовый";
                    }else if (/Ivory/.test(resultColour)){
                        filterColourName = "Слоновая кость";
                    }else if (/Khaki/.test(resultColour)){
                        filterColourName = "Хаки";
                    }else if (/Leather/.test(resultColour)){
                        filterColourName = "Кожа";
                    }else if (/Lemon/.test(resultColour)){
                        filterColourName = "Лимонный";
                    }else if (/Maroon/.test(resultColour)){
                        filterColourName = "Каштановый";
                    }else if (/Mint/.test(resultColour)){
                        filterColourName = "Мятный";
                    }else if (/Multi/.test(resultColour)){
                        filterColourName = "Разноцветный";
                    }else if (/Navy/.test(resultColour)){
                        filterColourName = "Темно-синий";
                    }else if (/Olive/.test(resultColour)){
                        filterColourName = "Оливковый";
                    }else if (/Orange/.test(resultColour)){
                        filterColourName = "Оранжевый";
                    }else if (/Orchid/.test(resultColour)){
                        filterColourName = "Орхидея";
                    }else if (/Pewter/.test(resultColour)){
                        filterColourName = "Оловянный";
                    }else if (/Pink/.test(resultColour)){
                        filterColourName = "Розовый";
                    }else if (/Plum/.test(resultColour)){
                        filterColourName = "Сливовый";
                    }else if (/Poppy/.test(resultColour)){
                        filterColourName = "Маковый";
                    }else if (/Purple/.test(resultColour) || /Purp/.test(resultColour)){
                        filterColourName = "Фиолетовый";
                    }else if (/Red/.test(resultColour)){
                        filterColourName = "Красный";
                    }else if (/Rose/.test(resultColour)){
                        filterColourName = "Розовый";
                    }else if (/Royal/.test(resultColour)){
                        filterColourName = "Королевский синий";
                    }else if (/Sand/.test(resultColour)){
                        filterColourName = "Песочный";
                    }else if (/Silver/.test(resultColour)){
                        filterColourName = "Серебряный";
                    }else if (/Tan/.test(resultColour)){
                        filterColourName = "Желтовато-коричневый";
                    }else if (/Taupe/.test(resultColour)){
                        filterColourName = "Темно-серый";
                    }else if (/Violet/.test(resultColour)){
                        filterColourName = "Фиолетовый";
                    }else if (/Yellow/.test(resultColour)){
                        filterColourName = "Желтый";
                    }else if (/Wht/.test(resultColour) || /White/.test(resultColour)){
                        filterColourName = "Желтый";
                    }else{
                        filterColourName = "Другие цвета"
                    }


                    if ( /Dark/.test(resultColour) || /Dk/.test(resultColour) ){
                        filterColourName = "Темно-" + filterColourName;
                    }
                }

                let regularExpDescription = /dnn_ctr\d+_ViewTemplate_ctl00_ctl\d\d_liReturnsTab(.*?)InfoScrollContain/
                
                let resultDescription;
                if (/<!--\smp_trans_remove_start="DE,FR,AT"\s--><br>/.test(data)){
                    resultDescription = data.substring(data.search(/<!--\smp_trans_remove_start="DE,FR,AT"\s--><br>/), data.search(/<br><br><!--/));
                }else if( /<!--\smp_trans_ost_start\s--.>\s--><br>/.test(data) ){
                    resultDescription = data.substring(data.search(/<!--\smp_trans_ost_start\s--.>\s--><br>/), data.search(/<br><br><!--/));
                }else{
                    resultDescription = null;
                }
                
                if ( resultDescription && resultDescription != null ){
//                    resultDescription = resultDescription[1];
                    resultDescription = resultDescription.replace(/<!--\smp_trans_remove_start="DE,FR,AT"\s-->/, "");
                    resultDescription = resultDescription.replace(/<!--\smp_trans_remove_end="DE,FR,AT"\s-->/, "");
                    resultDescription = resultDescription.replace(/<!--\smp_trans_add="DE,FR,AT"\s/, "");
                    resultDescription = resultDescription.replace(/<!--\smp_trans_ost_start\s--]> -->/, "");
                    resultDescription = resultDescription.replace(/<!--(.*?)-->/, "");
                }else{
                    resultDescription = null;
                }
//                console.log("resultDescription: " + resultDescription);
                  
                let d=new Date();
                let day=d.getDate();
                let month=d.getMonth() + 1;
                let year=d.getFullYear();
                  
                let hours = d.getHours();
                let minutes = d.getMinutes();
                let seconds = d.getSeconds();
                  
                let date = year + "-" + month + "-" + day;
                let dateAdd = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds ;


                  
                var regularExpStat = /liItem"\srole="radio"\stitle="(.*?)"\sdata-text="(.*?)" class="/g
                var resultStat = data.match(regularExpStat);
                  
                var regularExpStatSize = /data-text="(.*?)" class="/
                
                var regularExpSizeBreckets = /\((.*?)\)/
                                    
                var regularExpStatStock = /is\sout\sof\sstock/
                var resultStatStock = [];
                var resultStatSize = [];
                  
                let sizeMap = new Map();
                
                
                if ( resultStat ){  
                    for (let n = 0; n < resultStat.length; n++){
                        resultStatSize[n] = regularExpStatSize.exec(resultStat[n]);
                        resultStatSize[n] = resultStatSize[n][1];

                        if ( regularExpSizeBreckets.test(resultStatSize[n]) ){
                            resultStatSize[n] = regularExpSizeBreckets.exec(resultStatSize[n]);
                            resultStatSize[n] = resultStatSize[n][1];
                        }

                        if ( /.+\((.*)/.test(resultStatSize[n]) ){
                            resultStatSize[n] = resultStatSize[n].replace(/(.*)\(/, "");
                        }

                        resultStatStock[n] = regularExpStatStock.exec(resultStat[n]);

                        if ( resultStatStock[n] ){
                            resultStatStock[n] = false;
                        }else{
                            resultStatStock[n] = true;
                        }

                        sizeMap.set( resultStatSize[n], resultStatStock[n]);
                    }
                }
//                
//                 for (let [key, valuem] of sizeMap) {
//                        console.log( "key: "+ key + "; value: " + valuem);
//                 }
            
                var regularExpStatus = /<div\sclass="productImageSash">\s+?\n?<img\ssrc="(.*?)"\sid="imgProductSash"/
                var resultStatus = regularExpStatus.exec(data);

                if ( resultStatus ){
                    resultStatus = resultStatus[1];
                    
                    console.log("Status: " + resultStatus);
                    if ( resultStatus == "http://images.sportsdirect.com/images/sash/productsash_80off.png"){
                        resultStatus = 80;
                    }else if ( resultStatus == "http://images.sportsdirect.com/images/sash/productsash_PreOrder.png" ) {
                        resultStatus = "pre_order";
                    }else if ( resultStatus == "http://images.sportsdirect.com/images/sash/productsash_mustgo.png" ){
                        resultStatus = "must_go";      
                    }else if ( resultStatus == "http://images.sportsdirect.com/images/sash/productsash_MegaValue.png"){
                        resultStatus = "mega_value";
                    }else if ( resultStatus == "http://images.sportsdirect.com/images/sash/productsash_50off.png"){
                        resultStatus = 50;
                    }else{
                        resultStatus = null;
                    }
                        
                    
                }else{
                    resultStatus = null;
                }
                  
                console.log("path: " + resultPath);
                console.log("price: " + resultPrice);
                console.log("discount: " + resultDiscount);
                console.log("notFound: " + resultNotFound);
                console.log("resultManufactory: " + resultManufactory);
                console.log("resultColour: " + resultColour);
                console.log("filterColourName: " + filterColourName);
//                console.log("resultDescription: " + resultDescription);
                  
                let resultDescriptionTranslated = translateResultDescription(resultDescription);
                  
//                console.log(resultDescriptionTranslated);

//                for (let [key, valuem] of sizeMap) {
//                        console.log( "size: "+ key + "; status: " + valuem);
//                 }
                                  
                dataMap.set(prod_id, { product_id: lastProductId, model: model, ean: ean, path: resultPath, quantity: quantity, price: resultPrice, stock_status_id: stock_status_id, image: image, images: arrPathImages, manufacturer_id: manufactoryId, date: date, dateAdd: dateAdd, discount: resultDiscount, name: resultName, filterColourName: filterColourName, metaTitle: metaTitle, metaH1: metaH1, description: resultDescriptionTranslated, seo: seo, size: sizeMap, status: resultStatus, notFound: resultNotFound, productCode: resultProductCode});
                  
                prod_id += 1;                  
                  
                console.log("Loading product " + option.host + option.path  + " " + currentNumberOfSegments + " of " + Math.ceil(countQuery));
                writeData(dataMap, connection);
//                connection.end();
              });
            }
        
          request.end();

    
          request.on('error', function (e) {
                if (e.code==='ECONNRESET') {
//                    clientHandle.close();
                }
                console.log("This its error - " + e.message);
                checkIsEnd();
          });
}

function translateResultDescription( description ){
    let findDataReg;
    let resultDataStart;
    let resultDataEnd;
    let resultData;
    let tmp = description;

    resultData = /<br>&gt;/.exec(description);
    
    
    if ( description && resultData ){
        
        resultDataStart = description.substring(0,resultData.index);
        resultDataEnd = description.substring(resultData.index, description.length);

        console.log("resultDataStart: " + resultDataStart);
        console.log("resultDataEnd: " + resultDataEnd);
         
        // 8
        resultDataEnd = resultDataEnd.replace(/branding\sto\stongue\sand\sback\sof\sthe\sheel/ig, "брендинг на язычке и задней части пятки");
        
        
        //Семь слов
        resultDataEnd = resultDataEnd.replace(/Wipe\smidsole\sclean\swith\sa\sdamp\scloth/ig, "Подошва протирается чистой влажной тканью");
        
        // Шесть слов
        resultDataEnd = resultDataEnd.replace(/Wipe\sclean\swith\sa\sdamp\scloth/ig, "Протирается влажной тканью");
        resultDataEnd = resultDataEnd.replace(/3\stouch\sand\sclose\sfastening\sstraps/ig, "3 касания и закрываются крепежные ремни"); // проверить
        resultDataEnd = resultDataEnd.replace(/on\sthe\sside\spanel\sand\stongue/ig, "на боковой панели и язычке"); 
        
        //Пять слов
        resultDataEnd = resultDataEnd.replace(/adidas\slogos\sand\s3\sstripes/ig, "Логотип adidas и фирменные 3 полоски");
        resultDataEnd = resultDataEnd.replace(/padded\sheel\sand\sankle\scollar/ig, "мягкая пятка и воротник лодыжки");
        resultDataEnd = resultDataEnd.replace(/cushioned\smaterial\sfor\sshock\sabsorption/ig, "мягкий материал для поглощения ударов");
        resultDataEnd = resultDataEnd.replace(/colour\sand\spattern\scontrasting\spanelling/ig, "цвет и рисунок контрастной обшивки");
        resultDataEnd = resultDataEnd.replace(/pull\stab\son\sthe\sheel/ig, "язычок на пятке");
        resultDataEnd = resultDataEnd.replace(/suede\slook\slower\sreinforced\srim/ig, "внизу замшевый усиленный обод");
        
        //Чотири слова
        resultDataEnd = resultDataEnd.replace(/Cushioned,\sshaped\sankle\scollar/ig, "Мягкий, форменный воротник лодыжки");
        resultDataEnd = resultDataEnd.replace(/Synthetic\supper\sand\ssole/ig, "Верхняя часть и подошва с синтетики");
        resultDataEnd = resultDataEnd.replace(/Padded\scollar\sand\stongue/ig, "Мягкий воротник и язычок");
        resultDataEnd = resultDataEnd.replace(/Soft\supper\sknit\/mesh\sconstruction/ig, "Мягкий верхний трикотаж/конструкция сетки");
        resultDataEnd = resultDataEnd.replace(/stylish\sbut\sminimal\sdesign/ig, "стильный, но минималистичный дизайн");
        resultDataEnd = resultDataEnd.replace(/slim\sline\strainer\smidsole/ig, "тонкая линейная подошва");
        resultDataEnd = resultDataEnd.replace(/slim\sline\strainer\ssole/ig, "стильный, но минималистичный дизайн");
        resultDataEnd = resultDataEnd.replace(/Faux\ssuede\sankle\spanel/ig, "Искусственная замша лодыжки");
        resultDataEnd = resultDataEnd.replace(/hiking\sand\strekking\sboots/ig, "Пешие и туристические сапоги");
        resultDataEnd = resultDataEnd.replace(/Leather\sTopped\sOrthalite\sInsole/ig, "кожаная ортопедическая стелька"); // проверить
        resultDataEnd = resultDataEnd.replace(/Lace up fastening front/ig, "крепления на шнурке спереди"); 
        
        // Три слова
        resultDataEnd = resultDataEnd.replace(/Full\slace\sup/ig, "Обувь зашнуровывается");
        resultDataEnd = resultDataEnd.replace(/full\slace\sfastening/ig, "крепление в виде шнурка");
        resultDataEnd = resultDataEnd.replace(/functional\szip\sfastening/ig, "функциональная застежка-молния");
        resultDataEnd = resultDataEnd.replace(/Lace\sup\sfastening/ig, "На шнурке");
        resultDataEnd = resultDataEnd.replace(/Thick\smid\ssole/ig, "Толстая подошва");
        resultDataEnd = resultDataEnd.replace(/Padded\sankle\scollar/ig, "Мягкий воротник лодыжки ");
        resultDataEnd = resultDataEnd.replace(/Smooth\stoe\spanel/ig, "Гладкий носок");
        resultDataEnd = resultDataEnd.replace(/slim\sline\sdesign/ig, "Тонкие линии дизайна");
        resultDataEnd = resultDataEnd.replace(/stand\sout\slook/ig, "выдающийся вид");
        resultDataEnd = resultDataEnd.replace(/shaped\sankle\scollar/ig, "форменной воротник лодыжки");
        resultDataEnd = resultDataEnd.replace(/slight\spadded\scollar/ig, "слегка мягкий воротник");
        resultDataEnd = resultDataEnd.replace(/Dual\sdensity\smidsole/ig, "Двойная плотность стельки");
        resultDataEnd = resultDataEnd.replace(/distressed\seffect\sleather/ig, "эффект кожи");
        resultDataEnd = resultDataEnd.replace(/Moulded\sgrip\spattern/ig, "Литой образец подошви");     // Проверить
        resultDataEnd = resultDataEnd.replace(/moulded outsole/ig, "рельефна подошва");     // Проверить
        resultDataEnd = resultDataEnd.replace(/added\sankle\scollar/ig, "Мягкий воротник лодыжки");  
        resultDataEnd = resultDataEnd.replace(/External\sheel\scounter/ig, "Внешний каблук");  
        resultDataEnd = resultDataEnd.replace(/Deep\sflex\sgrooves/ig, "Глубокие отворы");  
        resultDataEnd = resultDataEnd.replace(/deep\stread\ssole/ig, "Грубая подошва");  
        resultDataEnd = resultDataEnd.replace(/thick\scushioning\smidsole/ig, "Толстая амортизирующая подошва");  
        resultDataEnd = resultDataEnd.replace(/Mens\scanvas\sshoes/ig, "Мужские кеды");  
        resultDataEnd = resultDataEnd.replace(/Padded\sankle\scollar/ig, "Мягкий воротник лодыжки");  
        resultDataEnd = resultDataEnd.replace(/Chunky\srubber\sSole/ig, "Коренастая резиновая подошва");  
        resultDataEnd = resultDataEnd.replace(/Colour\scontrasting\spanel/ig, "Контрастные цвета панели");  
        resultDataEnd = resultDataEnd.replace(/Colour\scontrasting\smidsole/ig, "Контрастные цвета подошви");  
        resultDataEnd = resultDataEnd.replace(/chunky\smoulded\soutsole/ig, "Коренастая формованная подошва");  
        resultDataEnd = resultDataEnd.replace(/colour\scontrasting\saccenting/ig, "акцент контрастных цветов");  
        resultDataEnd = resultDataEnd.replace(/contrasting\sstitch\sdetailing/ig, "контрастный шов");  
        resultDataEnd = resultDataEnd.replace(/Mens\srunning\sshoes/ig, "Мужские беговые кроссовки");  
        resultDataEnd = resultDataEnd.replace(/Mesh\spanelled\supper/ig, "Мягкая верхняя сетка");  
        resultDataEnd = resultDataEnd.replace(/max\sair\scushioning/ig, "максимальное проникновение воздуха");  
        resultDataEnd = resultDataEnd.replace(/synthetic\smidfoot\soverlays/ig, "Синтетические накладки средней части стопы");  
        resultDataEnd = resultDataEnd.replace(/Rubber\ssole\sinsert/ig, "резиновая подошва вставка");  
        resultDataEnd = resultDataEnd.replace(/durable\smoulded\soutsole/ig, "прочная литая подошва");  
        resultDataEnd = resultDataEnd.replace(/3\sstripe\sstyling/ig, "3 стильных полосы");  
        resultDataEnd = resultDataEnd.replace(/Coated\sleather\supper/ig, "верх покрытый кожой");  
        resultDataEnd = resultDataEnd.replace(/Waffle\sgrip\soutsole/ig, "сцепление подошвы Waffle");  
        resultDataEnd = resultDataEnd.replace(/breathability\smesh\spanelling/ig, "воздухопроницаемые сетчатые вставки");  
        resultDataEnd = resultDataEnd.replace(/knitted\spanel\sdetailing/ig, "трикотажные панели детализации");  
        
        //Два слова
        resultDataEnd = resultDataEnd.replace(/ankle\scollar/ig, "воротник лодыжки");
        resultDataEnd = resultDataEnd.replace(/Mens\strainers/ig, "Мужские кроссовки");
        resultDataEnd = resultDataEnd.replace(/Men's\strainers/ig, "Мужские кроссовки");
        resultDataEnd = resultDataEnd.replace(/multiple\spanels/ig, "несколько панелей"); //проверить
        resultDataEnd = resultDataEnd.replace(/Cushioned\sinsole/ig, "Мягкие стельки");
         resultDataEnd = resultDataEnd.replace(/Padded\sankle/ig, "Мягкий голеностоп");
        resultDataEnd = resultDataEnd.replace(/Textured\ssole/ig, "Текстурированная подошва");
        resultDataEnd = resultDataEnd.replace(/Textured\soutsole/ig, "Текстурированная подошва");
        resultDataEnd = resultDataEnd.replace(/Padded\stongue/ig, "Мягкий язычок");
         resultDataEnd = resultDataEnd.replace(/Perforated\sheel/ig, "Перфорированные пятки");
        resultDataEnd = resultDataEnd.replace(/Heel\sloop/ig, "Петля на каблуке");
        resultDataEnd = resultDataEnd.replace(/high\straction/ig, "высокие тяговые");
        resultDataEnd = resultDataEnd.replace(/Textile\sinner/ig, "Внутренняя часть - текстиль");
        resultDataEnd = resultDataEnd.replace(/thick\saggressive/ig, "толстая агрессивная");
        resultDataEnd = resultDataEnd.replace(/Branded\ssole/ig, "Фирменная подошва");
        resultDataEnd = resultDataEnd.replace(/brogue\sdetail/ig, "грубый ботинок");
        resultDataEnd = resultDataEnd.replace(/Shaped\sheel/ig, "Форменный каблук");
        resultDataEnd = resultDataEnd.replace(/Cushioned\sankle/ig, "Мягкая лодыжка");
        resultDataEnd = resultDataEnd.replace(/Mesh\spanels/ig, "Сетка");
        resultDataEnd = resultDataEnd.replace(/metal\seyelets/ig, "металлические люверсы");
        resultDataEnd = resultDataEnd.replace(/Suede\soverlays/ig, "Замшевые накладки");
        resultDataEnd = resultDataEnd.replace(/Suede\spanels/ig, "Замшевые панели");
        resultDataEnd = resultDataEnd.replace(/Padded\stongue/ig, "Протирается влажной тканью");
        resultDataEnd = resultDataEnd.replace(/padded\sinsole/ig, "мягкая стелька");
        resultDataEnd = resultDataEnd.replace(/please\snote/ig, "пожалуйста, обратите внимание");
        resultDataEnd = resultDataEnd.replace(/premium\squality/ig, "премиум качество");
        resultDataEnd = resultDataEnd.replace(/Mesh\supper/ig, "Верхняя сетка");
        resultDataEnd = resultDataEnd.replace(/Textured\stread/ig, "Текстурированная поверхность");
        resultDataEnd = resultDataEnd.replace(/Lace\sup/ig, "На шнурке");
        resultDataEnd = resultDataEnd.replace(/Lightweight\sconstruction/ig, "Легкая конструкция");
        resultDataEnd = resultDataEnd.replace(/laced\sfastening/ig, "Обувь зашнуровывается");
        resultDataEnd = resultDataEnd.replace(/lace\sfastening/ig, "Обувь зашнуровывается");
        resultDataEnd = resultDataEnd.replace(/lace\sdetailing/ig, "кружево");
        resultDataEnd = resultDataEnd.replace(/Thick\smidsole/ig, "Толстая подошва");
        resultDataEnd = resultDataEnd.replace(/thick\soutsole/ig, "Толстая подошва");
        resultDataEnd = resultDataEnd.replace(/Feature\sstitching/ig, "Особенное сшивания");
        resultDataEnd = resultDataEnd.replace(/Fitsole\sinsole/ig, "стелька Fitsole");
        resultDataEnd = resultDataEnd.replace(/fashion\spumps/ig, "модные туфли");
        resultDataEnd = resultDataEnd.replace(/foam\sinsole/ig, "вспененна стелька");
        resultDataEnd = resultDataEnd.replace(/Colours\scontrasting/ig, "контрастные цвета");
        resultDataEnd = resultDataEnd.replace(/contrasting\scolours/ig, "контрастные цвета");
        resultDataEnd = resultDataEnd.replace(/stitched\sdetailing/ig, "сшитая деталировка");
        resultDataEnd = resultDataEnd.replace(/stitched\sforefoot/ig, "сшитые стопы");
        resultDataEnd = resultDataEnd.replace(/small\sheel/ig, "маленький каблук");
        resultDataEnd = resultDataEnd.replace(/running\strainers/ig, "беговые кроссовки");
        resultDataEnd = resultDataEnd.replace(/rounded\stoe/ig, "закругленный носок");
        resultDataEnd = resultDataEnd.replace(/other\smaterials/ig, "другие материалы");
        resultDataEnd = resultDataEnd.replace(/water\sresistant/ig, "водонепроницаемые");
        resultDataEnd = resultDataEnd.replace(/gripped\ssole/ig, "крепкая подошва");
        resultDataEnd = resultDataEnd.replace(/gripped\smidsole/ig, "крепкая подошва");
        
        //Одне слово
        resultDataEnd = resultDataEnd.replace(/Lace-up/ig, "На шнурке");
        resultDataEnd = resultDataEnd.replace(/branding/ig, "бренд");
        resultDataEnd = resultDataEnd.replace(/Upper/ig, "Верхняя часть");
        resultDataEnd = resultDataEnd.replace(/leather/ig, "кожа");
        resultDataEnd = resultDataEnd.replace(/textile/ig, "текстиль");
        resultDataEnd = resultDataEnd.replace(/synthetic/ig, "синтетика");
        resultDataEnd = resultDataEnd.replace(/Lining/ig, "Подкладка");
        resultDataEnd = resultDataEnd.replace(/midsole/ig, "Подошва");
        resultDataEnd = resultDataEnd.replace(/Sole/ig, "Подошва");
        resultDataEnd = resultDataEnd.replace(/midsole/ig, "подошва");
        resultDataEnd = resultDataEnd.replace(/inner/ig, "внутренняя часть");
        resultDataEnd = resultDataEnd.replace(/technology/ig, "технология");
        resultDataEnd = resultDataEnd.replace(/Breathable/ig, "дышащий материал");
        resultDataEnd = resultDataEnd.replace(/logo/ig, "логотип");
        resultDataEnd = resultDataEnd.replace(/Swoosh/ig, "галочка");
        resultDataEnd = resultDataEnd.replace(/shaped/ig, "галочка");
        resultDataEnd = resultDataEnd.replace(/\sand\s/ig, " и ");
        resultDataEnd = resultDataEnd.replace(/mesh/ig, "сетка");
        resultDataEnd = resultDataEnd.replace(/runner/ig, "беговые");
        resultDataEnd = resultDataEnd.replace(/mens/ig, "мужские");
        resultDataEnd = resultDataEnd.replace(/shoes/ig, "обувь");
        resultDataEnd = resultDataEnd.replace(/stitched/ig, "сшитые");
        resultDataEnd = resultDataEnd.replace(/perforated/ig, "пористые");
        resultDataEnd = resultDataEnd.replace(/detailing/ig, "детали");
        resultDataEnd = resultDataEnd.replace(/detailed/ig, "деталное");
        resultDataEnd = resultDataEnd.replace(/detail/ig, "детали");
        resultDataEnd = resultDataEnd.replace(/style/ig, "стиль");
        resultDataEnd = resultDataEnd.replace(/design/ig, "дизайн");
        resultDataEnd = resultDataEnd.replace(/badge/ig, "значок");
        resultDataEnd = resultDataEnd.replace(/emblems/ig, "емблема");
        resultDataEnd = resultDataEnd.replace(/laced/ig, "зашнуровывается");
        resultDataEnd = resultDataEnd.replace(/lightly/ig, "легкий");
        resultDataEnd = resultDataEnd.replace(/cushioned/ig, "мягкая");
        resultDataEnd = resultDataEnd.replace(/moulded/ig, "формованная");
        resultDataEnd = resultDataEnd.replace(/boots/ig, "ботинки");
        resultDataEnd = resultDataEnd.replace(/fluffy/ig, "пушиста");
        resultDataEnd = resultDataEnd.replace(/subtle/ig, "изысканный");
        resultDataEnd = resultDataEnd.replace(/soft/ig, "нежна");
        resultDataEnd = resultDataEnd.replace(/supple/ig, "мягкая");
        resultDataEnd = resultDataEnd.replace(/panelled/ig, "обшитый панелями");
        resultDataEnd = resultDataEnd.replace(/suede/ig, "замша");
        resultDataEnd = resultDataEnd.replace(/collar/ig, "воротник");
        resultDataEnd = resultDataEnd.replace(/heel/ig, "каблук");
        resultDataEnd = resultDataEnd.replace(/stitching/ig, "сшивание");
        resultDataEnd = resultDataEnd.replace(/durable/ig, "прочные");
        resultDataEnd = resultDataEnd.replace(/waterproof/ig, "водонепроницаемые");
        resultDataEnd = resultDataEnd.replace(/embossed/ig, "рельефный");
        resultDataEnd = resultDataEnd.replace(/other/ig, "другие");
        resultDataEnd = resultDataEnd.replace(/sturdy/ig, "крепкая");
        
        
        if ( resultDataStart || resultDataEnd ){
            
           let tmpD = resultDataStart + resultDataEnd.toLowerCase();
            
           if (/<ul>/gi.test(tmpD) && /<li>/gi.test(tmpD)){
               
           }else if (/&amp;gt;/gi.test(tmpD)){
               tmpD = tmpD.replace(/&amp;gt;/, "<ul><li>");
                    tmpD = tmpD.replace(/&amp;gt;/gi, "</li><li>");
                         
                    if (tmpD.split(" ").splice(-1) != "</ul>"){
                        tmpD = tmpD + "</li> </ul>";
                    }
           }else{
               tmpD = tmpD.replace(/&gt;/, "<ul><li>");
               tmpD = tmpD.replace(/&gt;/gi, "</li><li>");

                if (tmpD.split(" ").splice(-1) != "</ul>"){
                    tmpD = tmpD + "</li> </ul>";
                }
           }
            
//        if (/&lt;p<ul>/gi.test(readDBData[counter].desc)){
//           let tmpDesc =  readDBData[counter].desc.replace(/<\/?ul>/g, "");
//           tmpDesc =  tmpDesc.replace(/<\/li><li>/g, "&gt;");
//           tmpDesc =  tmpDesc.replace(/<\/li>/g, "");
//           tmpDesc =  tmpDesc.replace(/<li>/g, "&gt;");
        
            
            return tmpD;
        }else{
            return null;
        }
    }else{
        return null;
    }
    
}

function downloadImage (uri, filename, callback){
  requestToImage.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
	
	 if (err){
		 if (err.code === 'ECONNRESET'){
		  console.error('ECONNRESET connection');
		} else { 
		  throw error; 
		}  
	 }

	
    requestToImage(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function writeData(dataMap, connection){
//    console.log([...dataMap]); 
    let mapTmp =[];  
    let mapTmpSize = new Map();
    let mapTmpDiscount = new Map();

//    connection.connect();
    let i = 0;
    
// pool.getConnection(function(err, connection) {
//    connection.connect();

    
    dataMap.forEach(function(value, key, dataMap){
        
        i = i + 1;
                
        if ( value.price ) {
            
//            if ( value.price <= 30 ){
//                value.price = value.price + 18
//            }else if ( value.price > 30 && value.price <= 40 ){
//                value.price = value.price * 1.8;
//            }else if ( value.price > 40 && value.price <= 80 ){
//                value.price = value.price * 1.5;
//            }else {
//                value.price = value.price * 1.3;
//            }
//            
//            if ( value.discount ){
//                    if ( value.discount <= 30 ){
//                        value.discount = value.discount + 18
//                    }else if ( value.discount > 30 && value.discount <= 40 ){
//                        value.discount = value.discount * 1.8;
//                    }else if ( value.discount > 40 && value.discount <= 80 ){
//                        value.discount = value.discount * 1.5;
//                    }else {
//                        value.discount = value.discount * 1.3;
//                    }
//            }
            
            console.log( " value.price after: " +  value.price + "value.discount after: " + value.discount);
            console.log( " upc: " +  value.price + "up: " + value.path);

            parent.connection.query('INSERT INTO oc_product (product_id, model, upc, ean, mpn, quantity, stock_status_id, image, manufacturer_id, shipping, price, points, tax_class_id, date_available, weight, weight_class_id, length, width, height, length_class_id, subtract, minimum, sort_order, status, viewed, date_added, date_modified) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [value.product_id, value.model, value.path, value.ean, value.productCode, value.quantity, value.stock_status_id, value.image, value.manufacturer_id, 1, value.price, 0, 0, value.date, 0, 1, 0,0,0,1,1,1,1,1,0, value.dateAdd, value.dateAdd ], function(err, result) {
                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("Product update successfully! - " + countUpdate);
                        }
                      }
                    else
                        console.log('Error while performing Query in oc_product.' + err);
                    
            });
                        
            parent.connection.query('INSERT INTO oc_product_to_category (product_id, category_id, main_category) VALUES (?,?,?)', [value.product_id, downloadingCategory, 0], function(err, result){
                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("Product update successfully! - " + countUpdate);
                        }
                      }
                    else
                        console.log('Error while performing Query in oc_product_to_category.' + err);         
            });
            
            parent.connection.query('INSERT INTO oc_size_to_product(size_id, product_id) VALUES (?,?)', [numberTableSizeToProduct, value.product_id], function(err, result){
                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in insert oc_size_to_product!");
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("oc_size_to_product update successfully! - " + countUpdate);
                        }
                      }
                    else
                        console.log('Error while performing Query in oc_size_to_product.' + err);         
            });
            
            
            parent.connection.query('INSERT INTO oc_url_alias(query, keyword) VALUES (?,?)', ["product_id=" + value.product_id, value.seo], function(err, result){
                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in oc_url_alias!");
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("Product update successfully! - " + countUpdate);
                        }
                      }
                    else
                        console.log('Error while performing Query in oc_url_alias.' + err);         
            });
            
            
            
            parent.connection.query('INSERT INTO oc_product_to_store (product_id, store_id) VALUES (?,?)', [value.product_id, 0], function(err, result){
                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("Product update successfully! - " + countUpdate);
                        }
                      }
                    else
                        console.log('Error while performing Query in oc_product_to_store.' + err);         
            });
            
             parent.connection.query('INSERT INTO oc_product_filter (product_id, filter_id) VALUES (?,?)', [value.product_id, parent.mapFilterColoursData.get(value.filterColourName)], function(err, result){
                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("Product update successfully! - " + countUpdate);
                        }
                      }
                    else
                        console.log('Error while performing Query in oc_product_to_store.' + err);         
            });
            
            let language_id = [1,2];
            
            if ( value.description != null ){
                for (let i=0; i < language_id.length; i++){
                    parent.connection.query('INSERT INTO oc_product_description (product_id, language_id, name, description, meta_title, meta_h1) VALUES (?,?,?,?,?,?)', [value.product_id, language_id[i], value.name, value.description, value.metaTitle, value.metaH1 + value.name ], function(err, result){
                        if (!err){
                            if (result.length == 0) {
                                    console.log("Don`t find results in query to mySql in update price and stock status!");
                            }else{
                                countUpdate = countUpdate + 1;
                                console.log("Product update successfully! - " + countUpdate);
                            }
                          }
                        else
                            console.log('Error while performing Query in oc_product_description.' + err);         
                    });
                }
            }else{
                for (let i=0; i < language_id.length; i++){
                    parent.connection.query('INSERT INTO oc_product_description (product_id, language_id, name) VALUES (?,?,?)', [value.product_id, language_id[i], value.name], function(err, result){
                        if (!err){
                            if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");
                            }else{
                                countUpdate = countUpdate + 1;
                                console.log("Product update successfully! - " + countUpdate);
                            }
                          }
                        else
                            console.log('Error while performing Query in oc_product_description.' + err);         
                    });
                }
            }
            
            if ( value.images ){
                
                for (let i=1; i < value.images.length; i++){
                    parent.connection.query('INSERT INTO oc_product_image (product_id, image, sort_order) VALUES (?,?,?)', [value.product_id, value.images[i], 0], function(err, result){
                        if (!err){
                            if (result.length == 0) {
                                    console.log("Don`t find results in query to mySql in update price and stock status!");
                            }else{
                                countUpdate = countUpdate + 1;
                                console.log("Image update successfully! - " + countUpdate);
                            }
                          }
                        else
                            console.log('Error while performing Query in oc_product_image.' + err);         
                    });
                }
            }

               
            let product_id_Size = 0;
            let product_id_Discount = 0;
            
            mapTmpSize.set(value.product_id, value.size);
            product_id_Size = value.product_id;
                
            product_id_Discount = value.product_id;
            mapTmpDiscount.set(value.product_id, value.discount);

            
            if ( value.notFound ){
//                setNotFoundProduct( value.path );
                checkIsEnd();
            }else{
                if ( value.discount != 0 && value.discount != null ){
                    startUpdateDiscount( product_id_Discount, value.discount, product_id_Size, value.size);
                }else{
                    startUpdateSize( product_id_Size, value.size );
                }     
            }
          
        }      
        else{
            console.log("Error product update: does not fint data on web site!!! Product - " + value.path );
//            setNotFoundProduct( value.path );
            checkIsEnd();
        }

    });
}

function startUpdateDiscount( product_id, discount, product_id_Size, size){
        parent.connection.query('INSERT INTO oc_product_special (product_id, customer_group_id, priority, price) VALUES (?,?,?,?)', [ product_id, 1,0, discount], function(err, rows, fiesld){
                    if (!err){
                            if (rows.length == 0) {
                                console.log("Don`t find results in query to mySql!");
                                startUpdateSize( product_id_Size, size );
                            }else{
                                console.log("Discount update succssesful");
                                startUpdateSize( product_id_Size, size );
                            }
                          }
                     else
                            console.log('Error while performing Query in oc_product_special.' + err);
        });
}
    
function startUpdateSize( product_id, size ){
    
         parent.connection.query('INSERT INTO oc_product_option (product_id, option_id,required) VALUES (?,?,?)', [ product_id, 11, 1], function(err, rows, fiesld){
                    if (!err){
                            if (rows.length == 0) {
                                console.log("Don`t find results in query to mySql!");
                                checkIsEnd();
                            }else{
                                console.log("Sise update succssesful");

                                startUpdateSizeTwo( product_id, size);
                            }
                          }
                     else{
                         console.log('Error while performing Query in oc_product_option.' + err);
                         checkIsEnd();
                     }
                            
        });
    
}

function startUpdateSizeTwo( product_id, size ){
    
         parent.connection.query('SELECT product_option_id FROM oc_product_option WHERE product_id = ?', [ product_id ], function(err, rows, fiesld){
                    if (!err){
                            if (rows.length == 0) {
                                console.log("Don`t find results in query to mySql!");
                                checkIsEnd();
                            }else{
                                console.log("Sise update succssesful");
                                for (let i = 0; i < rows.length; i++ ){
                                    console.log("product_option_id: " + rows[i].product_option_id);
                                }
                                let product_option_id = rows[0].product_option_id;
                                startUpdateSizeThree( product_id, size, product_option_id);
                            }
                          }
                     else{
                         console.log('Error while performing Query in oc_product_option. 2' + err);
                         checkIsEnd();
                     }
                            
        });
    
}

function startUpdateSizeThree(product_id, size, product_option_id){
        currentNumberOfUpdateSize = 0;
            
        for (let [razmer, nalichie] of size) {
            
            razmer = razmer.replace(/\./,",");
            
            parent.connection.query('INSERT INTO oc_product_option_value( product_option_id, product_id, option_id, option_value_id, quantity, subtract, price,price_prefix,points_prefix,weight_prefix) VALUES (?,?,?,?,?,?,?,?,?,?)', [product_option_id, product_id, 11, mapOptionDesc.get(razmer), (nalichie == true) ? 50 : 0, 1, 0,"+","+","+"], function(err, rows, fields) {
                          if (!err){
                            if (rows.length == 0) {
                                    currentNumberOfUpdateSize++;
                                    console.log("Don`t find results in query to mySql!");
                            }else{
                                currentNumberOfUpdateSize++;
                                if ( currentNumberOfUpdateSize == size.size ){
                                    checkIsEnd();
                                }
                            }
                          }
                          else{
                              console.log('Error while performing Query in oc_product_option_value.' + err);
                              currentNumberOfUpdateSize++;
                              if ( currentNumberOfUpdateSize == size.size ){
                                 checkIsEnd();
                              }
                          }
            });
        }
}

    
function checkIsEnd(){
    currentNumberOfSegments = currentNumberOfSegments + 1;

    if ( currentNumberOfSegments < parent.newProducts.length ){
        downloadSegm( currentNumberOfSegments );
    }else{
        
        console.log("Loading related products...");
                
//        addRelatedProducts( currentRelatedUpdateNumber, currentRelatedUpdateNumberSecond );
        chackRelated();
        
    }
}

function chackRelated(){
        for (let i = 0; i <parent.arrRelatet.length; i++){
             for (let j = 0; j <parent.arrRelatet.length; j++){
                 if (parent.arrRelatet[i].name ==parent.arrRelatet[j].name &&parent.arrRelatet[i].product_id !=parent.arrRelatet[j].product_id ){
//                     console.log("1 - product_id: " +parent.arrRelatet[i].product_id + "; name: " +parent.arrRelatet[i].name );
//                     console.log("2 - product_id: " +parent.arrRelatet[j].product_id + "; name: " +parent.arrRelatet[j].name );
                     
                     if (mapVarianteToProducts.has(parent.arrRelatet[i].product_id) && mapVarianteToProducts.get(parent.arrRelatet[i].product_id) == parent.arrRelatet[j].product_id){
                    
                    }else{
                     
                      parent.connection.query('INSERT INTO oc_related_variant_to_product(product_id, related_id, related_variant_id) VALUES (?,?,?)', [ parent.arrRelatet[i].product_id, parent.arrRelatet[j].product_id, 1], function(err, rows, fiesld){
                            if (!err){
                                     if (rows.length == 0) {
                                         console.log("Don`t find results in query to mySql!");

                                     }else{
                                         console.log("Related update succssesful");
                                     }
                            }
                            else{
                                 console.log('Error while performing Query in oc_related_variant_to_product' + err);
                            }
                     });
                    }
//					 parent.connection.query('INSERT INTO oc_related_variant_to_product(product_id, related_id, related_variant_id) VALUES (?,?,?)', [parent.arrRelatet[j].product_id, parent.arrRelatet[i].product_id, 1], function(err, rows, fiesld){
//                            if (!err){
//                                     if (rows.length == 0) {
//                                         console.log("Don`t find results in query to mySql!");
//
//                                     }else{
//                                         console.log("Related update succssesful");
//                                     }
//                            }
//                            else{
//                                 console.log('Error while performing Query in oc_related_variant_to_product' + err);
//                            }
//                     });
            
            }
              
        }
    }
       
    parent.connection.end();
}

function addRelatedProducts( currentRelatedUpdateNumber, currentRelatedUpdateNumberSecond ) {
    if ( currentRelatedUpdateNumber !=  parent.arrRelatet.length - 1 ){
    
        if ( parent.arrRelatet[currentRelatedUpdateNumber].name == parent.arrRelatet[currentRelatedUpdateNumberSecond].name && parent.arrRelatet[currentRelatedUpdateNumber].product_id != parent.arrRelatet[currentRelatedUpdateNumberSecond].product_id ){
            
            if (mapVarianteToProducts.get(parent.arrRelatet[currentRelatedUpdateNumber].product_id) == parent.arrRelatet[currentRelatedUpdateNumberSecond].product_id){
                    currentRelatedUpdateNumberSecond++;
                    if ( currentRelatedUpdateNumberSecond == parent.arrRelatet.length - 1 ){
                            currentRelatedUpdateNumber++;
                            currentRelatedUpdateNumberSecond = currentRelatedUpdateNumber;
                    }
                    addRelatedProducts( currentRelatedUpdateNumber, currentRelatedUpdateNumberSecond );
            }else{
                parent.connection.query('INSERT INTO oc_related_variant_to_product(product_id, related_id, related_variant_id) VALUES (?,?,?)', [ parent.arrRelatet[currentRelatedUpdateNumber].product_id, parent.arrRelatet[currentRelatedUpdateNumberSecond].product_id, 1], function(err, rows, fiesld){
                      if (!err){
                                 if (rows.length == 0) {
                                     console.log("Don`t find results in query to mySql!");
                                                 currentRelatedUpdateNumberSecond++;
                                        if ( currentRelatedUpdateNumberSecond == parent.arrRelatet.length - 1 ){
                                            currentRelatedUpdateNumber++;
                                            currentRelatedUpdateNumberSecond = currentRelatedUpdateNumber;
                                        }

                                        addRelatedProducts( currentRelatedUpdateNumber, currentRelatedUpdateNumberSecond );
                                 }else{
                                     console.log("Related update succssesful");
                                                 currentRelatedUpdateNumberSecond++;
                                        if ( currentRelatedUpdateNumberSecond == parent.arrRelatet.length - 1 ){
                                            currentRelatedUpdateNumber++;
                                            currentRelatedUpdateNumberSecond = currentRelatedUpdateNumber;
                                        }

                                        addRelatedProducts( currentRelatedUpdateNumber, currentRelatedUpdateNumberSecond );
                                 }
                        }
                        else{
                             console.log('Error while performing Query in oc_related_variant_to_product' + err);
                                        currentRelatedUpdateNumberSecond++;
                                        if ( currentRelatedUpdateNumberSecond == parent.arrRelatet.length - 1 ){
                                            currentRelatedUpdateNumber++;
                                            currentRelatedUpdateNumberSecond = currentRelatedUpdateNumber;
                                        }

                                        addRelatedProducts( currentRelatedUpdateNumber, currentRelatedUpdateNumberSecond );
                        }
                });
            }
            
        }else{
            currentRelatedUpdateNumberSecond++;
            if ( currentRelatedUpdateNumberSecond == parent.arrRelatet.length - 1 ){
                currentRelatedUpdateNumber++;
                currentRelatedUpdateNumberSecond = 0;
            }
            
            addRelatedProducts( currentRelatedUpdateNumber, currentRelatedUpdateNumberSecond );
        }
    }else{
                
        parent.connection.end();
        console.log("Database connection closed");
        console.log("Done!");
    }
}



    function validateOptionsHost(host){

          let regularExpValidateHost = /\//;
          let regularExpValidateHostProtocol = /http:\/\//;

          if ( regularExpValidateHostProtocol.test( host ) ){

                host =  host.replace(regularExpValidateHostProtocol, '');
          }

          if ( regularExpValidateHost.test( host ) ){
                host = host.replace(regularExpValidateHost, '');
          }

          host = host.replace(/\s/g, '');

          return host;
    }

    function validateOptionsPath(path){
            if (!/^\//.test( path )){
                path = "/" + path;
            }

            path = path.replace(/\s/g, '');

            return path;
    }


module.exports.downloadDataNewProductsFromWebSite = downloadDataNewProductsFromWebSite;