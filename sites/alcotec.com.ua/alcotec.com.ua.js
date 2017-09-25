
let mdvdPrice = require('./../../mdvd-price-notfound');
const https = require('https');


function downloadDataFromWebSiteLiebherr(option, http){
          
          console.log("option-" + mdvdPrice.tmpcounter + ": " + option.host + option.path + ". Product_id: " + option.product_id);
          request = https.request(option, callbackData);
            
          function callbackData(res) {

              let data = '';
              
              res.on('data', function (chunk) {
                data += chunk;
              });

              res.on('end', function () {
                  
                console.log( "DOWNLOAD DATA FROM ALCOTEC!!!!");
                console.log("option-" + mdvdPrice.tmpcounter + ": " + option.host + option.path + ". Product_id: " + option.product_id);
                mdvdPrice.tmpcounter++;
                  
                let regularExpPath = /addToCart\((.*?)\);"><\/span>/
                let resultPath = regularExpPath.exec(data);  
                  
                if ( resultPath ){
                    resultPath = resultPath[1];
                    resultPath = "/catalog/item/" + resultPath;
                }else{
                    resultPath = null;
                }
                  
                console.log("REGULAR PATH: " + resultPath);
                  
                let regularExpNotFound = /<h1>\s(.*?)<\/h1>/
                let resultNotFound = regularExpNotFound.exec(data);  
                  
               console.log("resultNotFound: " + resultNotFound);
                if ( resultNotFound != null){
                    if ( resultNotFound[1] == "Ошибка 404. Страница  не найдена"  || resultNotFound[1] == "Доступ запрещен"){
                        console.log("Warning: " + resultNotFound[1] + " - " + resultPath);
                        resultNotFound = true;
						mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', option.path, function(err, result) {

							if (!err){
								if (result.length == 0) {
									console.log("Don`t find results in query to mySql in update not fined products!");
								}else{

								}
							  }
							else{    
								console.log('Error while performing Query in update not fined products in liebherr!' );
							}

                    	});

                    }else{
                        resultNotFound = false;
//                        mdvdPrice.mapTmp.push( resultPath );

                    }
                }
                
				  let regularExpStockStaus;
				  if ( /<p\sclass="color">\s?.?<strong\sstyle="color:green;margin-top:5px;">(.*?)<\/strong>/.test(data) ){
                      regularExpStockStaus = /<p\sclass="color">\s?.?<strong\sstyle="color:green;margin-top:5px;">(.*?)<\/strong>/
                  }else if ( /<strong\sstyle="color:#00CCFF!important;">(.*?)<\/strong>/.test(data) ) {
                      regularExpStockStaus = /<strong\sstyle="color:#00CCFF!important;">(.*?)<\/strong>/
                  }else if (  /<strong\sstyle="color:#1B505C;margin-top:5px;">(.*?)<\/strong>/.test(data) ){
					  regularExpStockStaus =  /<strong\sstyle="color:#1B505C;margin-top:5px;">(.*?)<\/strong>/
				  }else if (  /<strong><a\shref="\/articles\/4"\sstyle="color:#1B505C;margin-top:5px;">(.*?)<\/a><\/strong>/.test(data) ){
					  regularExpStockStaus =  /<strong><a\shref="\/articles\/4"\sstyle="color:#1B505C;margin-top:5px;">(.*?)<\/a><\/strong>/
				  }else{
					  regularExpStockStaus = /<strong\sstyle="color:green;margin-top:5px;">(.*?)<\/strong>/
				  }
				
				 
                let resultStockStatus = regularExpStockStaus.exec(data);  
                let quantity;
                if ( resultStockStatus != null){
                    if ( resultStockStatus[1] == "Есть в наличии"  || resultStockStatus[1] == "В наличии"){
						resultStockStatus = 7;
						quantity = 50;
                    }else if ( resultStockStatus[1] == "Под заказ" ){
						resultStockStatus = 8;
						quantity = 0;
					}else if ( resultStockStatus[1] == "Наличие уточняйте" ){
						resultStockStatus = 11;
						quantity = 0;
					}else if ( resultStockStatus[1] == "Есть в наличии. Доставка через 5 рабочих дней" ){
						resultStockStatus = 6;
						quantity = 0;
					}else{
						resultStockStatus = 5;
						quantity = 0;
                    }
                }else{
				    resultStockStatus = 5;
				    quantity = 0;
                }
                                                      
                let regularExpPrice;
                
                  if ( /цена\s-\s<strong>(.*?)\sгрн\.<\/strong><\/p>/.test(data) ){
                      regularExpPrice = /цена\s-\s<strong>(.*?)\sгрн\.<\/strong><\/p>/
                  }else{
                      regularExpPrice = /цена\s-\s<strong>(.*?)\sгрн\.<\/strong><\/p>/
                  }
                  
                let resultPrice = regularExpPrice.exec(data);

                if ( resultPrice ){
                    resultPrice = resultPrice[1].replace(/\s/g, '');
                    console.log("price: " + resultPrice);
                }else{
                    resultPrice = null;
                }
                                  
                let regularExpManufacturer = /<a\sclass="itemName">(.*?)\s-.*<\/a><\/p>/
                let resultManufacturer = regularExpManufacturer.exec(data);  
                  
                if ( resultManufacturer ){
                    resultManufacturer = resultManufacturer[1];
                }else{
                    resultManufacturer = null;
                }


                let regularExpRange = /Protect\sKitchen\sRange/gi;

                let resultRange = regularExpRange.exec(data);

                if (resultRange) {
                    resultPrice = 0;
                    resultStockStatus = 'range';
                    quantity = 0;
                } 
                  
                console.log("resultStockStatus: " + resultStockStatus);
                
                mdvdPrice.dataMap.set(mdvdPrice.prod_id, { path: resultPath, price: resultPrice, exchangeRates: null, manufacturer: resultManufacturer, stockStatus: resultStockStatus, quantity: quantity, status: null, notFound: resultNotFound });
                  
                mdvdPrice.prod_id += 1;                  
                  
                console.log("Loading product Franke " + option.host + option.path  + " " + mdvdPrice.currentNumberOfSegments + " of " + Math.ceil(mdvdPrice.countQuery));
                  
                
                writeData(mdvdPrice.dataMap);
              });
            }
        
          request.end();

    
          request.on('error', function (e) {
                if (e.code==='ECONNRESET') {
                }
                console.log("This its error - " + e.message);
                connection.end();
          });
}

function writeData(dataMap){
    console.log([...dataMap]);    
    let i = 0;
    let mapTmpDiscount = new Map();

    
    dataMap.forEach(function(value, key, dataMap){
        
        i = i + 1;
                
        if ( value.price ) {
            

            value.price = value.price / 27.7;
        
            let discount = 0;
            console.log("Price: " + value.price);
//            if (value.manufacturer == "Zanussi"){
//                value.price = value.price * 0.9;
//            }else if (value.manufacturer == "Whirlpool"){
//                value.price = value.price * 0.9;
//            }else if (value.manufacturer == "Electrolux"){
//                value.price = value.price * 0.9;
//            }else if (value.manufacturer == "Gorenje"){
//                value.price = value.price * 0.91;
//            }
            
            console.log("Price: " + value.price);
            
            value.price = parseFloat(value.price).toFixed(2);
     
                mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = ?,price = ?, stock_status_id = ? WHERE  jan= ?', [value.quantity, value.price, value.stockStatus, value.path], function(err, result) {

                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");

                        }else{
                            mdvdPrice.countUpdate = mdvdPrice.countUpdate + 1;
                            console.log("Product update successfully! - " + mdvdPrice.countUpdate);
                        }
                      }
                    else{
                        console.log('Error while performing Query in update price and stock status.');

                    }
                    
                });
            
            
            if (discount != 0){

                
                for (let [key, valuem] of map) {     

                  if (key == value.path && key){
                      
                      mapTmpDiscount.set(valuem.product_id, discount);
                      
                  }
                }
            }
                       
            if ( dataMap.size == i ){ 
                       mdvdPrice.currentNumberOfSegments = mdvdPrice.currentNumberOfSegments + 1;

                        if ( mdvdPrice.currentNumberOfSegments < mdvdPrice.arrData.length ){
                            mdvdPrice.downloadSegm( mdvdPrice.currentNumberOfSegments );
                        }else{
                            mdvdPrice.connection.end();
                            console.log("Database connection closed");
                            console.log("Done!");
                        }
            }                        
        } else if (!value.price && value.stockStatus === 'range') {
            console.log('SSSSSSSSSSSSSSSSS');
            mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 0, price = 0, stock_status_id = 11 WHERE  jan= ?', [option.path], function (err, result) {

                if (!err) {
                    if (result.length == 0) {
                        console.log("Don`t find results in query to mySql in update price and stock status!");

                    } else {
                        mdvdPrice.countUpdate = mdvdPrice.countUpdate + 1;
                        console.log("Product update successfully! - " + mdvdPrice.countUpdate);
                    }
                }
                else {
                    console.log('Error while performing Query in update price and stock status.');

                }

            });

            if (dataMap.size == i) {
                mdvdPrice.currentNumberOfSegments = mdvdPrice.currentNumberOfSegments + 1;

                if (mdvdPrice.currentNumberOfSegments < mdvdPrice.arrData.length) {
                    mdvdPrice.downloadSegm(mdvdPrice.currentNumberOfSegments);
                } else {
                    mdvdPrice.connection.end();
                    console.log("Database connection closed");
                    console.log("Done!");
                }
            }             
        } else if (!value.price && value.stockStatus) {
            mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = ? WHERE  jan= ?', [value.stockStatus, option.path], function(err, result) {

                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");

                        }else{
                            mdvdPrice.countUpdate = mdvdPrice.countUpdate + 1;
                            console.log("Product update successfully! - " + mdvdPrice.countUpdate);
                        }
                      }
                    else{
                        console.log('Error while performing Query in update price and stock status.');

                    }
                    
                });
            
            if ( dataMap.size == i ){ 
                       mdvdPrice.currentNumberOfSegments = mdvdPrice.currentNumberOfSegments + 1;

                        if ( mdvdPrice.currentNumberOfSegments < mdvdPrice.arrData.length ){
                            mdvdPrice.downloadSegm( mdvdPrice.currentNumberOfSegments );
                        }else{
                            mdvdPrice.connection.end();
                            console.log("Database connection closed");
                            console.log("Done!");
                        }
            }                        
        }   
        else{
            console.log("Error product update: does not fint data on web site!!! Product - " + value.path );
//            if ( pool._freeConnections.indexOf(connection) == -1 );
//                        connection.release();    
            mdvdPrice.currentNumberOfSegments = mdvdPrice.currentNumberOfSegments + 1;
            if ( mdvdPrice.currentNumberOfSegments < mdvdPrice.arrData.length ){
                mdvdPrice.downloadSegm( mdvdPrice.currentNumberOfSegments );
            }else{

//                            for ( let i=0; i < mdvdPrice.arrJan.length; i++){
//                                if ( !mdvdPrice.mapTmp.includes( mdvdPrice.arrJan[i] )){
//
//                                        mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', mdvdPrice.arrJan[i], function(err, result) {
//
//                                            if (!err){
//                                                if (result.length == 0) {
//                                                    console.log("Don`t find results in query to mySql in update not fined products!");
//                                                }else{
//
//                                                }
//                                              }
//                                            else{    
//                                                console.log('Error while performing Query in update not fined products!' +  mdvdPrice.arrJan[i]);
//                                            }
//
//                                        });
//                                }
//                            }

                            mdvdPrice.connection.end();
                            console.log("Database connection closed");
                            console.log("Done!");
            }
            
            if ( dataMap.size == i ){
                   mdvdPrice.currentNumberOfSegments = mdvdPrice.currentNumberOfSegments + 1;

                        if ( mdvdPrice.currentNumberOfSegments < mdvdPrice.arrData.length ){
                            mdvdPrice.downloadSegm( mdvdPrice.currentNumberOfSegments );
                        }else{

//                            for ( let i=0; i < mdvdPrice.arrJan.length; i++){
//                                if ( !mdvdPrice.mapTmp.includes( mdvdPrice.arrJan[i] )){
//
//                                        mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', mdvdPrice.arrJan[i], function(err, result) {
//
//                                            if (!err){
//                                                if (result.length == 0) {
//                                                    console.log("Don`t find results in query to mySql in update not fined products!");
//                                                }else{
//
//                                                }
//                                              }
//                                            else{    
//                                                console.log('Error while performing Query in update not fined products!' +  mdvdPrice.arrJan[i]);
//                                            }
//
//                                        });
//                                }
//                            }

                            mdvdPrice.connection.end();
                            console.log("Database connection closed");
                            console.log("Done!");
                        }
            }
        }

    });    
}

module.exports = downloadDataFromWebSiteLiebherr;