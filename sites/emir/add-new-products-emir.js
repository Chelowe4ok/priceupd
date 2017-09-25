    let parent = require('./../../add-new-products');

    let countQuery;
    let options = [];
    let currentNumberOfSegments = 0;
    let prod_id = 0;
    let dataMap = new Map();

    function downloadDataNewProductsFromWebSite(http,connection){
        console.log("Start: ");
        createOptionsToDownload();

            console.log("connection close!");
            connection.end();
    }

    function createOptionsToDownload(){

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

        downloadSegm( currentNumberOfSegments );
    }

    function downloadSegm( currentNumberOfSegments ){
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


            if ( option.host == "www.emir.kiev.ua"){
//                    downloadDataFromWebSite( option, parent.http );
            }else if ( option.host == "s-group.org.ua" ){
//                    downloadDataFromWebSiteSGroup( option, parent.http );
            }else{
                console.log("Error!!! Not find host name: " + option.host);
//                downloadDataFromWebSite( option, parent.http );
            }
    }

    function downloadDataFromWebSite(option){
          
          request = http.request(option, callbackData);
              
          function callbackData(res) {

              var data = '';
              
              res.on('data', function (chunk) {
                data += chunk;
              });

              res.on('end', function () {
                  
                var regularExpPath = /"\saction="(.*?)"\smethod="post"\sid="/
                var resultPath = regularExpPath.exec(data);  
                  
                if ( resultPath ){
                    resultPath = resultPath[1];
//                    console.log("Path :" + resultPath);
                }else{
                    resultPath = null;
                }
                  
                var regularExpNotFound = /h1\sclass="page-header">(.*?)<\/h1>/
                var resultNotFound = regularExpNotFound.exec(data);  
                  
               
                if ( resultNotFound != null){
                    if ( resultNotFound[1] == "Страница не найдена"  || resultNotFound[1] == "Доступ запрещен"){
                        console.log("Warning: " + resultNotFound[1] + " - " + resultPath);
                        resultNotFound = true;

                    }else{
                        resultNotFound = false;
                        mapTmp.push( resultPath );

                    }
                }  

                  
                var regularExpExchangeRates = /<br\s\/>Курс гривны\s(.*?)\s?<\/section>/
                var resultExchangeRates = regularExpExchangeRates.exec(data);  
                  
                if ( resultExchangeRates ){
                    resultExchangeRates = resultExchangeRates[1];
//                    console.log("resultExchangeRates :" + resultExchangeRates);
                }else{
                    resultExchangeRates = null;
                }
                  
                var regularExpManufacturers = /<h1\sclass="page-header">(.*?)<\/h1>/
                var resultManufacturers = regularExpManufacturers.exec(data);  
                  
                if ( resultManufacturers ){
                    resultManufacturers = resultManufacturers[1];
                    resultManufacturers = resultManufacturers.split(" ")[0];     
//                    console.log("resultManufacturers :" + resultManufacturers);
                }else{
                    resultManufacturers = null;
                }

                var regularExpPrice = /<div\sclass="price"><span\sclass="strong">\s?(.*?)<\/span>/
                var resultPrice = regularExpPrice.exec(data);

                if ( resultPrice ){
                    resultPrice = resultPrice[1].replace(/\s/g, '');
//                    console.log("price: " + resultPrice);
                }else{
                    resultPrice = null;
                }

                var regularExpStockStatus  =/<div><span\sstyle="color:#A9A9A9;">(.*?)<\/span><\/div>/
                var resultStockStatus = regularExpStockStatus.exec(data);

                if ( resultStockStatus ){
                    resultStockStatus = resultStockStatus[1];
//                    console.log("Stock status: " + resultStockStatus);
                }else{
                    resultStockStatus = null;
                }

                var regularExpStatus = /position:\sinitial;">(.*?)<\/span>/
                var resultStatus = regularExpStatus.exec(data);

                if ( resultStatus ){
                    resultStatus = resultStatus[1];
//                    console.log("Status: " + resultStatus);
                }else{
                    resultStatus = null;
                }
                  
                dataMap.set(prod_id, { path: resultPath, price: resultPrice, exchangeRates: resultExchangeRates, manufacturer: resultManufacturers, stockStatus: resultStockStatus, status: resultStatus, notFound: resultNotFound });
                  
                prod_id += 1;                  
                  
                console.log("Loading product " + option.host + option.path  + " " + currentNumberOfSegments + " of " + Math.ceil(countQuery));
                
                writeData(dataMap);
              });
            }
        
          request.end();

    
          request.on('error', function (e) {
                if (e.code==='ECONNRESET') {
//                    clientHandle.close();
                }
                console.log("This its error - " + e.message);
          });
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