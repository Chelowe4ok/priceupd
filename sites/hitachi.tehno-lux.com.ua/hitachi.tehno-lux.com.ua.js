 
let mdvdPrice = require('./../../mdvd-price-notfound');

function downloadDataFromWebSiteSGroup( option, http ){
          
          console.log("option-" + mdvdPrice.tmpcounter + ": " + option.host + option.path + ". Product_id: " + option.product_id);
          request = http.request(option, callbackData);
            
          function callbackData(res) {

              let data = '';
              
              res.on('data', function (chunk) {
                data += chunk;
              });

              res.on('end', function () {
                  
                console.log( "DOWNLOAD DATA FROM HITACHI!!!!");
                console.log("option-" + mdvdPrice.tmpcounter + ": " + option.host + option.path + ". Product_id: " + option.product_id);
                mdvdPrice.tmpcounter++;
                let regularExpPath = /<link\srel="canonical"\shref="http:\/\/hitachi\.tehno-lux\.com\.ua(.*?)"\s\/>/
                let resultPath = regularExpPath.exec(data);  
                
                if ( resultPath ){
                    resultPath = resultPath[1];
                }else{
                    resultPath = null;
                }
                  
                console.log("REGULAR PATH: " + resultPath);
                  
                let regularExpNotFound = /<h1>(.*?)<\/h1>/
                let resultNotFound = regularExpNotFound.exec(data);  
               
                if ( resultNotFound != null){
                    if ( resultNotFound[1] == ""  || resultNotFound[1] == "Доступ запрещен"){
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
								console.log('Error while performing Query in update not fined products in sgroupe!');
							}

                    	});
                    }else{
                        resultNotFound = false;
//                        mdvdPrice.mapTmp.push( resultPath );
                    }
                }  
                  
                console.log("Not Found: " + resultNotFound);
                  
                let regularExpPrice = /Цена:\s<\/span>(.*?)по\sкурсу/
                
                let resultPrice = regularExpPrice.exec(data);

                if ( resultPrice ){
                    resultPrice = resultPrice[1].replace(/\s/g, '');
                    console.log("price: " + resultPrice);
                }else{
                    resultPrice = null;
                }
                  
                console.log("resultPath: " + resultPath);
                console.log("price: " + resultPrice);
                console.log("notFound: " + resultNotFound);
               
                let ddata = data.substring(7000,8000);
                   console.log("data: " + ddata);
                mdvdPrice.dataMap.set(mdvdPrice.prod_id, { path: resultPath, price: resultPrice, exchangeRates: null, manufacturer: "Hitachi", stockStatus: null, status: null, notFound: resultNotFound });
                  
                mdvdPrice.prod_id += 1;                  
                  
                console.log("Loading product SMEG " + option.host + option.path  + " " + mdvdPrice.currentNumberOfSegments + " of " + Math.ceil(mdvdPrice.countQuery));
                
//                writeData(mdvdPrice.dataMap);
              });
            }
        
          request.end();

          request.on('error', function (e) {
                if (e.code==='ECONNRESET') {
                }
                console.log("This its error - " + e.message);
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
            let stock_status_id = 7;

            if (value.manufacturer){
                value.manufacturer = value.manufacturer.toUpperCase();
            }
            
            if ( stock_status_id == 7 ){
                mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 50,price = ?, stock_status_id = ? WHERE  jan= ?', [value.price, stock_status_id, value.path], function(err, result) {

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
            } else {
                mdvdPrice.connection.query('UPDATE mdvdoc_product SET quantity = 0, price = ?, stock_status_id = ? WHERE  jan= ?', [value.price, stock_status_id, value.path], function(err, result) {

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
            }
            
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

module.exports = downloadDataFromWebSiteSGroup;