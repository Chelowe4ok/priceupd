
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
                  
                console.log( "DOWNLOAD DATA FROM Liebherr!!!!");
                console.log("option-" + mdvdPrice.tmpcounter + ": " + option.host + option.path + ". Product_id: " + option.product_id);
                mdvdPrice.tmpcounter++;
                  
                let regularExpPath = /<input\stype=hidden\sname="url"\svalue="(.*?)">/
                let resultPath = regularExpPath.exec(data);  
                  
                if ( resultPath ){
                    resultPath = resultPath[1];
                }else{
                    resultPath = null;
                }
                  
                console.log("REGULAR PATH: " + resultPath);
                  
                let regularExpNotFound = /<title>(.*?)<\/title>/
                let resultNotFound = regularExpNotFound.exec(data);  
                  
               
                if ( resultNotFound != null){
                    if ( resultNotFound[1] == "Liebherr — Ошибка 404. Страница не найдена."  || resultNotFound[1] == "Доступ запрещен"){
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
				  if ( /<p\sclass="goods-statut\sends-stock">(.*?)<\/p>/.test(data) ){
                      regularExpStockStaus = /<p\sclass="goods-statut\sends-stock">(.*?)<\/p>/
                  }else if ( /<p\sclass="goods-statut\sin-stock">(.*?)<\/p>/.test(data) ) {
                      regularExpStockStaus = /<p\sclass="goods-statut\sin-stock">(.*?)<\/p>/
                  }else if (  /<p\sclass="goods-statut\sout-of-production">(.*?)<\/p>/.test(data) ){
					  regularExpStockStaus =  /<p\sclass="goods-statut\sout-of-production">(.*?)<\/p>/
				  }else if (  /<p\sclass="goods-statut\spre-order">(.*?)<\/p>/.test(data) ){
					  regularExpStockStaus =  /<p\sclass="goods-statut\spre-order">(.*?)<\/p>/
				  }else{
					  regularExpStockStaus = /<p\sclass="goods-statut\sends-stock">(.*?)<\/p>/
				  }
				
				 
                let resultStockStatus = regularExpStockStaus.exec(data);  
                let quantity;
                if ( resultStockStatus != null){
                    if ( resultStockStatus[1] == "Заканчивается"  || resultStockStatus[1] == "В наличии"){
						resultStockStatus = 7;
						quantity = 50;
                    }else if ( resultStockStatus[1] == "Под заказ" ){
						resultStockStatus = 8;
						quantity = 0;
					}else{
						resultStockStatus = 5;
						quantity = 0;
                    }
                }
                                    
                console.log("Stock satus: " + resultStockStatus);
                  
                let regularExpPrice;
                
                  if ( /<div\sclass="new-price">(.*?)\sгрн<\/div>/.test(data) ){
                      regularExpPrice = /<div\sclass="new-price">(.*?)\sгрн<\/div>/
                  }else{
                      regularExpPrice = /<div\sclass="new-price">(.*?)\sгрн<\/div>/
                  }
                  
                let resultPrice = regularExpPrice.exec(data);

                if ( resultPrice ){
                    resultPrice = resultPrice[1].replace(/\s/g, '');
                    console.log("price: " + resultPrice);
                }else{
                    resultPrice = null;
                }
                
                console.log("resultPrice: " + resultPrice);
                
                mdvdPrice.dataMap.set(mdvdPrice.prod_id, { path: resultPath, price: resultPrice, exchangeRates: null, manufacturer: "LIEBHERR", stockStatus: resultStockStatus, quantity: quantity, status: null, notFound: resultNotFound });
                  
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

//            if (value.manufacturer){
//                value.manufacturer = value.manufacturer.toUpperCase();
//            }
            
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

//                            for ( let i=0; i < mdvdPrice.arrJan.length; i++){
//                                if ( !mdvdPrice.mapTmp.includes( mdvdPrice.arrJan[i] )){
//
//                                        mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', mdvdPrice.arrJan[i], function(err, result) {
//
//                                            if (!err){
//                                                if (result.length == 0) {
//                                                    console.log("Don`t find results in query to mySql in update not fined products!");
//                                                }else{
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