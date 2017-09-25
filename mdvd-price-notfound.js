let http = require('http');
let mysql = require('mysql');
let static = require('node-static');

// require sites
let downloadDataFromWebSiteSGroup = require('./sites/sgroup/sgroup.js');
let downloadDataFromWebSiteFrankeStore = require('./sites/www.frankestore.com.ua/www.frankestore.com.ua.js');
let downloadDataFromWebSiteViyar = require('./sites/viyar.ua/viyar.ua.js');
let downloadDataFromWebSiteLiebherr = require('./sites/liebherr.com.ua/liebherr.com.ua.js');
let downloadDataFromWebSiteAlcotec = require('./sites/alcotec.com.ua/alcotec.com.ua.js');
let downloadDataFromWebSiteHitachi = require('./sites/hitachi.tehno-lux.com.ua/hitachi.tehno-lux.com.ua.js');

//const EventEmitter = require('events');
let file = new static.Server('.');

let dataMap = new Map();
let map = new Map();
let numberOfSegments;
let lastSegmentsSize = 0;
let arrDataLastSegment = [];
let arrDataSegment = [];
let arrData = [];
let currentNumberOfSegments = 0;
let currentCountAll = 0;
let pool;
let arrJan = [];
let mapTmp =[];

let tmpcounter = 0;


//http.createServer( function(req, res) {
//    
//  file.serve(req, res);
//
//}).listen(8080);



//setInterval( start, 60000);
start();

function start(){
//pool = mysql.createPool({
//    connectionLimit : 10, //important
//    host     : 'localhost',
//    user     : 'root',
//    password : '',
//    database : 'mdvd2',
//    debug    :  false
//});

let connection = mysql.createConnection({
    
//    host     : 'mdvd.mysql.ukraine.com.ua',
//    user     : 'mdvd_armadio',
//    password : 'w5m6rc8s',
//    database : 'mdvd_armadio'
    
      host     : 'mdvd.mysql.ukraine.com.ua',
      user     : 'mdvd_db',
      password : 'a5sz25o9',
      database : 'mdvd_db'

    
//    host     : 'localhost',
//    user     : 'root',
//    password : '',
//    database : 'work',
//    debug    :  false
    
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});


// connection.on('close', function(err) {
//          if (err) {
//            console.log( "Oops! Unexpected closing of connection, lets reconnect back.");
//          } else {
//            console.log('Connection closed normally.');
//          }
//});

//pool.getConnection(function(err, connection) {
    connection.query('SELECT ean,jan, product_id from mdvdoc_product WHERE ean != "NULL" AND ean != "" AND ean = "www.frankestore.com.ua" AND product_id > 0', function(err, rows, fields) {
//        connection.end();
      if (!err){
        if (rows.length == 0) {
                console.log("Don`t find results in query to mySql!");
//                       if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
        }else{
//                           if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                for (let i = 0; i < rows.length; i++ ){
                    map.set(rows[i].jan, { host: rows[i].ean, product_id: rows[i].product_id });
                }
//                console.log([...map]);
                arrData = rows;
            
                for (let i=0; i< arrData.length; i++){
                    arrJan.push(arrData[i].jan);
                }
            console.log("arrJan : " + arrJan.length);
            createOptionsToDownload(rows);
        }
      }
      else{
          
          console.log('Error while performing Query.');
          connection.end();
      }
    });
//});
//connection.end();

let prod_id = 0;
let countQuery;
let currentCountQuery = 0;
let countUpdate = 0;
let currentNumberOfSegments = 0;
let numberOfSegments;
let lastSegmentsSize;
let options = [];
let request;

function createOptionsToDownload(rows){
    
    countQuery = arrData.length / 1;
    options = [];
    
//    pool = new http.Agent(  ); 
    
    let agent = new http.Agent({
        
        keepAlive: true,
        keepAliveMsecs: 50,
        maxSockets: 3,
        maxFreeSockets: 3
        
    });
    
    console.log("arrData.length: " + arrData.length);
    console.log("rows.length: " + rows.length);
    countQuery =  arrData.length;
    
    module.exports.countQuery = countQuery;
    module.exports.countUpdate = countUpdate;
    module.exports.connection = connection;
    module.exports.arrData = arrData;
    module.exports.arrJan = arrJan;

    downloadSegm( currentNumberOfSegments );
}
    
function downloadSegm( currentNumberOfSegments ){
          dataMap.clear(); 

          if ( currentNumberOfSegments < arrData.length ){ 

                    let hostValidated = validateOptionsHost(arrData[currentNumberOfSegments].ean);
                    let valPath = validateOptionsPath(arrData[currentNumberOfSegments].jan);
                    option = {
                        host: hostValidated,
//                        host: "www.emir.kiev.ua",
                        path: valPath,
//                        strictSSL: false,
                        product_id: arrData[currentNumberOfSegments].product_id
                    };        
            }
    
    
    console.log("option data: " + option.host + option.path + " product_id: " + option.product_id);

    
    if ( option.host == "www.emir.kiev.ua"){
            downloadDataFromWebSite( option, http );
    }else if ( option.host == "s-group.org.ua" ){
            downloadDataFromWebSiteSGroup( option, http );
    }else if ( option.host == "www.frankestore.com.ua" ){
            downloadDataFromWebSiteFrankeStore( option, http );
    }else if ( option.host == "viyar.ua" ){
            downloadDataFromWebSiteViyar( option, http );
    }else if ( option.host == "liebherr.com.ua" ){
            downloadDataFromWebSiteLiebherr( option, http );
    }else if ( option.host == "alcotec.com.ua" ){
            downloadDataFromWebSiteAlcotec( option, http );
    }else if ( option.host == "hitachi.tehno-lux.com.ua" ){
            downloadDataFromWebSiteHitachi( option, http );
    }
    else{
        console.log("Error!!! Not find host name: " + option.host);
//        downloadDataFromWebSite( option, http );
        
        
        currentNumberOfSegments = currentNumberOfSegments + 1;

    if ( currentNumberOfSegments < arrData.length ){
        downloadSegm( currentNumberOfSegments );
    }else{
        
//        for ( let i=0; i < arrJan.length; i++){
//            if ( !mapTmp.includes( arrJan[i] )){
//                
//                    connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', arrJan[i], function(err, result) {
//
//                        if (!err){
//                            if (result.length == 0) {
//                                console.log("Don`t find results in query to mySql in update not fined products!");
//                            }else{
//
//                            }
//                          }
//                        else{    
//                            console.log('Error while performing Query in update not fined products!' +  arrJan[i]);
//                        }
//                        
//                    });
//            }
//        }

        connection.end();
        console.log("Database connection closed");
        console.log("Done!");
        
    }
    }
}


function downloadDataFromWebSite(option){
    
     
//      for (let option = 0; option < options.length / 1; option++){
//          console.log('Check URL: ', options[option].host + options[option].path);
//          console.log('Past WHERE product_id = : ', options[option].product_id);
          
          console.log("option-" + tmpcounter + ": " + option.host + option.path + ". Product_id: " + option.product_id);
          request = http.request(option, callbackData);
          

//          request.setMaxListeners(30);
    
          function callbackData(res) {

              let data = '';
              
              res.on('data', function (chunk) {
                data += chunk;
              });

              res.on('end', function () {
                  
                  console.log("option-" + tmpcounter + ": " + option.host + option.path + ". Product_id: " + option.product_id);
                  tmpcounter++;
                let regularExpPath = /"\saction="(.*?)"\smethod="post"\sid="/
                let resultPath = regularExpPath.exec(data);  
                  
                if ( resultPath ){
                    resultPath = resultPath[1];
//                    console.log("Path :" + resultPath);
                }else{
                    resultPath = null;
                }
                  
                let regularExpNotFound = /h1\sclass="page-header">(.*?)<\/h1>/
                let resultNotFound = regularExpNotFound.exec(data);
                  

                let secondPath; 
               
                if ( resultNotFound != null){
                    if ( resultNotFound[1] == "Страница не найдена"  || resultNotFound[1] == "Доступ запрещен"){
                        resultNotFound = true;
                        console.log("Warning: " + resultNotFound[1] + " - " + option.host + option.path);
                        resultNotFound = true;
                        secondPath = option.path;
						connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', option.path, function(err, result) {

							if (!err){
								if (result.length == 0) {
									console.log("Don`t find results in query to mySql in update not fined products!");
								}else{

								}
							  }
							else{    
								console.log('Error while performing Query in update not fined products in emir!' );
							}

                    	});
                    }else{
                        resultNotFound = false;
//                        mapTmp.push( resultPath );
                    }
                }  
                  
                let regularExpExchangeRates = /<br\s\/>Курс гривны\s(.*?)\s?<\/section>/
                let resultExchangeRates = regularExpExchangeRates.exec(data);  
                  
                if ( resultExchangeRates ){
                    resultExchangeRates = resultExchangeRates[1];
//                    console.log("resultExchangeRates :" + resultExchangeRates);
                }else{
                    resultExchangeRates = null;
                }
                  
                let regularExpManufacturers = /<h1\sclass="page-header">(.*?)<\/h1>/
                let resultManufacturers = regularExpManufacturers.exec(data);  
                  
                if ( resultManufacturers ){
                    resultManufacturers = resultManufacturers[1];
                    resultManufacturers = resultManufacturers.split(" ")[0];     
//                    console.log("resultManufacturers :" + resultManufacturers);
                }else{
                    resultManufacturers = null;
                }

                let regularExpPrice = /<div\sclass="price"><span\sclass="strong">\s?(.*?)<\/span>/
                let resultPrice = regularExpPrice.exec(data);

                if ( resultPrice ){
                    resultPrice = resultPrice[1].replace(/\s/g, '');
//                    console.log("price: " + resultPrice);
                }else{
                    resultPrice = null;
                }

                let regularExpStockStatus  =/<div><span\sstyle="color:#A9A9A9;">(.*?)<\/span><\/div>/
                let resultStockStatus = regularExpStockStatus.exec(data);

                if ( resultStockStatus ){
                    resultStockStatus = resultStockStatus[1];
//                    console.log("Stock status: " + resultStockStatus);
                }else{
                    resultStockStatus = null;
                }

                let regularExpStatus = /position:\sinitial;">(.*?)<\/span>/
                let resultStatus = regularExpStatus.exec(data);

                if ( resultStatus ){
                    resultStatus = resultStatus[1];
//                    console.log("Status: " + resultStatus);
                }else{
                    resultStatus = null;
                }
                  
                console.log("resultNotFound: " + resultNotFound);
                  
                dataMap.set(prod_id, { path: resultPath, price: resultPrice, exchangeRates: resultExchangeRates, manufacturer: resultManufacturers, stockStatus: resultStockStatus, status: resultStatus, notFound: resultNotFound, secondPath: secondPath });
                  
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
//      }
}

function writeData(dataMap){
//    console.log([...dataMap]);    
    let mapTmpDiscount = new Map();
    
//    connection.connect();
    let i = 0;
    
// pool.getConnection(function(err, connection) {
//    connection.connect();

    
    dataMap.forEach(function(value, key, dataMap){
        
        i = i + 1;
                
        if ( value.price && value.exchangeRates && value.stockStatus) {
            
            let stock_status_id;
            
            if ( value.stockStatus == "есть в наличии" ){
                stock_status_id = 7;
            }else if ( value.stockStatus == "под заказ" || value.stockStatus == "наличие уточняйте" ){
                stock_status_id = 8;
            }else if ( value.stockStatus == "поставка 3-4 дня" || value.stockStatus == "поставка 5-6 дней"){
                stock_status_id = 6;      
            }else {
                stock_status_id = 8;
            }
            
            value.price = value.price / 27.7;
        
            let discount;

            if (value.manufacturer){
                value.manufacturer = value.manufacturer.toUpperCase();
            }

            if (value.manufacturer == "BOSCH"){
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.00 - (value.price * 0.0);
            }
            else if  (value.manufacturer == "ELECTROLUX") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.0 - (value.price * 0.0);
            }
            else if  (value.manufacturer ==  "HOTPOINT-ARISTON") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.0- (value.price * 0.0);
            }
            else if  (value.manufacturer == "INTERLINE") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.0 - (value.price * 0);
            }
            else if  (value.manufacturer == "SIEMENS") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.0 - (value.price * 0.0);
            }
            else if  (value.manufacturer == "BLANCO") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.0- (value.price * 0.00);
            }
            else if  (value.manufacturer == "SMEG") {
                discount = value.price - (value.price * 0.135);
                value.price = value.price - (value.price * 0.07);
            }
            else if  (value.manufacturer == "ZANUSSI") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.0- (value.price * 0.0);
            }
            else if  (value.manufacturer == "WHIRLPOOL") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.0 - (value.price * 0);
            }
            else if  (value.manufacturer == "CANDY") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.0- (value.price * 0.0);
            }
            else if  (value.manufacturer == "TEKA") {
                discount = value.price - (value.price * 0.05);
                value.price = value.price - (value.price * 0.05);
            }
            else if  (value.manufacturer == "NARDI") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00 - (value.price * 0.0);
            }
            else if  (value.manufacturer == "ROSIERES") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00- (value.price * 0.00);
            }
            else if  (value.manufacturer == "ELICA") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.00 - (value.price * 0);
            }
            else if  (value.manufacturer == "FABER") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00 - (value.price * 0);
            }
            else if  (value.manufacturer == "ELLECI") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.00 - (value.price * 0);
            }
            else if  (value.manufacturer == "LIEBHERR") {
                discount = value.price - (value.price * 0.09);
                value.price = value.price - (value.price * 0.04);
            }
            else if  (value.manufacturer == "GAGGENAU") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00 - (value.price * 0.00);
            }
            else if  (value.manufacturer == "IN-SINK-ERATOR") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.00 - (value.price * 0.00);
            }
            else {
                discount = 0;
                console.log("Warning: don`t find manufacturer " + value.manufacturer);
            }
//            pool.getConnection(function(err, connection) {
//                console.log(connection);
            
            if ( stock_status_id == 7 ){
                connection.query('UPDATE mdvdoc_product SET quantity = 50,price = ?, stock_status_id = ? WHERE  jan= ?', [value.price, stock_status_id, value.path], function(err, result) {
//                    connection.end();

                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");
//                                if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("Product update successfully! - " + countUpdate);
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }
                      }
                    else{
//                        if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        console.log('Error while performing Query in update price and stock status.');

                    }
                    
                });
            } else {
                connection.query('UPDATE mdvdoc_product SET quantity = 0, price = ?, stock_status_id = ? WHERE  jan= ?', [value.price, stock_status_id, value.path], function(err, result) {
//                    connection.end();

                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price and stock status!");
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }else{
                            countUpdate = countUpdate + 1;
                            console.log("Product update successfully! - " + countUpdate);
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }
                      }
                    else{
//                                if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                                console.log('Error while performing Query in update price and stock status.');
                    }
                    
                });
            }
//            });
            
            
            if (discount != 0){

                
                for (let [key, valuem] of map) {
                    
//                    console.log("Key: " + key);
//                    console.log("value.path: " + value.path);
//                    console.log("valuem.product_id: " + valuem.product_id);
//                    console.log("map: " + [...map]);        

                  if (key == value.path && key){
                      
                      mapTmpDiscount.set(valuem.product_id, discount);
                      
                  }
                }


            }
                       
            if ( dataMap.size == i ){ 
                
//                console.log("THIS MESSAGE WAS ONE Size");
                startUpdateDiscount(mapTmpDiscount);
            }
            
//            if (map.has(value.path)){
//                
//                mapTmp.push( value.path );
//            }
                        
        }else if ( value.price && value.exchangeRates ){
            
            value.price = value.price / 27.7;
        
            let discount;

            if (value.manufacturer){
                value.manufacturer = value.manufacturer.toUpperCase();
            }

            if (value.manufacturer == "BOSCH"){
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.05 - (value.price * 0.0);
            }
            else if  (value.manufacturer == "ELECTROLUX") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.00 - (value.price * 0.0);
            }
            else if  (value.manufacturer ==  "HOTPOINT-ARISTON") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00- (value.price * 0.0);
            }
            else if  (value.manufacturer == "INTERLINE") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.00 - (value.price * 0);
            }
            else if  (value.manufacturer == "SIEMENS") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00 - (value.price * 0.0);
            }
            else if  (value.manufacturer == "BLANCO") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.00- (value.price * 0.00);
            }
            else if  (value.manufacturer == "SMEG") {
                discount = value.price - (value.price * 0.135);
                value.price = value.price - (value.price * 0.07);
            }
            else if  (value.manufacturer == "ZANUSSI") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.0- (value.price * 0.0);
            }
            else if  (value.manufacturer == "WHIRLPOOL") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.0 - (value.price * 0);
            }
            else if  (value.manufacturer == "CANDY") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.0- (value.price * 0.0);
            }
            else if  (value.manufacturer == "TEKA") {
                discount = value.price - (value.price * 0.08);
                value.price = value.price - (value.price * 0.05);
            }
            else if  (value.manufacturer == "NARDI") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.0 - (value.price * 0.0);
            }
            else if  (value.manufacturer == "ROSIERES") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.0- (value.price * 0.00);
            }
            else if  (value.manufacturer == "ELICA") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.0 - (value.price * 0);
            }
            else if  (value.manufacturer == "FABER") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00 - (value.price * 0);
            }
            else if  (value.manufacturer == "ELLECI") {
                discount = value.price - (value.price * 0);
                value.price = value.price * 1.00 - (value.price * 0);
            }
            else if  (value.manufacturer == "LIEBHERR") {
                discount = value.price - (value.price * 0.09);
                value.price = value.price - (value.price * 0.09);
            }
            else if  (value.manufacturer == "GAGGENAU") {
                discount = value.price - (value.price * 0.0);
                value.price = value.price * 1.00 - (value.price * 0.00);
            }
            else if  (value.manufacturer == "IN-SINK-ERATOR") {
                discount = value.price - (value.price * 0.00);
                value.price = value.price * 1.00 - (value.price * 0.00);
            }
            else{
                discount = 0;
                console.log("Warning: don`t find manufacturer " + value.manufacturer);
            }
            
//            pool.getConnection(function(err, connection) {
            
            if ( stock_status_id == 7 ){
                connection.query('UPDATE mdvdoc_product SET quantity = 50, price = ? WHERE  jan= ?', [value.price, value.path], function(err, result) {
//                    connection.end();

                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price!");
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }else{
                            console.log("Product update only price, without stock status!");
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }
                      }
                    else{
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                            console.log('Error while performing Query in update price.');
                    }
                    
                });
            }else {
                
                connection.query('UPDATE mdvdoc_product SET quantity = 0, price = ? WHERE  jan= ?', [value.price, value.path], function(err, result) {
//                    connection.end();

                    if (!err){
                        if (result.length == 0) {
                                console.log("Don`t find results in query to mySql in update price!");
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }else{
                            console.log("Product update only price, without stock status!");
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }
                      }
                    else{                            
                        if ( pool._freeConnections.indexOf(connection) == -1 );
                                        connection.release();
                        console.log('Error while performing Query in update price.');
                        }
                    
                });
            }
            
//            });
            
            if (map.has(value.path)){
                
//                mapTmp.push( value.path );
            }
            
            if (discount != 0){

                
                for (let [key, valuem] of map) {      

                  if (key == value.path && key){
                      
                      mapTmpDiscount.set(valuem.product_id, discount);
                             
                      
                  }
                }


            }
                       
            if ( dataMap.size == i ){ 
                
//                console.log("THIS MESSAGE WAS ONE Size");
                startUpdateDiscount(mapTmpDiscount);
            }
            
        }else if ( value.stockStatus ){
                        
            let stock_status_id;
            
            if ( value.stockStatus == "есть в наличии" ){
                stock_status_id = 7;
            }else if ( value.stockStatus == "под заказ" || value.stockStatus == "наличие уточняйте" ){
                stock_status_id = 8;
            }else if ( value.stockStatus == "поставка 3-4 дня" || value.stockStatus == "поставка 5-6 дней"){
                stock_status_id = 6;      
            }else {
                stock_status_id = 8;
            }
            
                connection.query('UPDATE mdvdoc_product SET stock_status_id = ? WHERE  jan= ?', [stock_status_id, value.path], function(err, result) {
//                    connection.end();

                    if (!err){
                        if (result.length == 0) {
                            console.log("Don`t find results in query to mySql in update stock status!");
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }else{
                            console.log("Product update only stock status, without price!");
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                        }
                      }
                    else{
//                            if ( pool._freeConnections.indexOf(connection) == -1 );
//                                        connection.release();
                            console.log('Error while performing Query in update stock status.');

                    }
                    
                });
            
            if ( dataMap.size == i ){
                startUpdateDiscount(mapTmpDiscount);
            }
        }else if (value.notFound && value.secondPath){
            
            console.log("secondPath: " + value.secondPath)
            connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', value.secondPath, function(err, result) {

							if (!err){
								if (result.length == 0) {
									console.log("Don`t find results in query to mySql in update not fined products!");
                                    currentNumberOfSegments = currentNumberOfSegments + 1;
                                    if ( currentNumberOfSegments < arrData.length ){
                                        downloadSegm( currentNumberOfSegments );
                                    }

                                    if ( dataMap.size == i ){
                                        startUpdateDiscount(mapTmpDiscount);
                                    }
								}else{
                                    currentNumberOfSegments = currentNumberOfSegments + 1;
                                    if ( currentNumberOfSegments < arrData.length ){
                                        downloadSegm( currentNumberOfSegments );
                                    }

                                    if ( dataMap.size == i ){
                                        startUpdateDiscount(mapTmpDiscount);
                                    }
								}
							  }
							else{    
								console.log('Error while performing Query in update not fined products in emir!' );
                                currentNumberOfSegments = currentNumberOfSegments + 1;
                                    if ( currentNumberOfSegments < arrData.length ){
                                        downloadSegm( currentNumberOfSegments );
                                    }

                                    if ( dataMap.size == i ){
                                        startUpdateDiscount(mapTmpDiscount);
                                    }
							}

                    	});
        }        
        else{
            console.log("Error product update: does not fint data on web site!!! Product - " + value.path );
//            if ( pool._freeConnections.indexOf(connection) == -1 );
//                        connection.release();    
            currentNumberOfSegments = currentNumberOfSegments + 1;
            if ( currentNumberOfSegments < arrData.length ){
                downloadSegm( currentNumberOfSegments );
            }
            
            if ( dataMap.size == i ){
                startUpdateDiscount(mapTmpDiscount);
            }
        }

    });
// });
    
}

class Options {
    
    constructor( host, path, product_id ){
        this.host = host;
        this.path = path;
        this.product_id = product_id;
    }
    
    get getHost(){
        return this.host;
    }
    
    get getPath(){
        return this.path;
    }
    
    get getProduct_id(){
        return this.product_id;
    }
}


function startUpdateDiscount(mapTmpDiscount){
        
    
//        pool.getConnection(function(err, connection) {
//    connection.connect();

             for (let [key, valuem] of mapTmpDiscount) {

    //        for (let prod_id = 0; prod_id < products_id_arr.length; prod_id++){

                if (key){


                    connection.query('UPDATE mdvdoc_product_discount SET quantity = 5, price = ? WHERE product_id = ?', [valuem,key], function(errr, result) {
//                        connection.end();

                            if (!errr){
                                if (result.length == 0) {
                                        console.log("No product discount");
//                                    if ( pool._freeConnections.indexOf(connection) == -1 );
//                                            connection.release();
                                }else{
//                                        if ( pool._freeConnections.indexOf(connection) == -1 );
//                                            connection.release();
                                        console.log("Discount update successfully!");
                                }
                            }
                            else{
                                console.log('Error while performing Query errr.' + errr);

//                                if ( pool._freeConnections.indexOf(connection) == -1 );
//                                    connection.release();
                            }

                            });
                    
                    connection.query('DELETE FROM mdvdoc_product_special WHERE product_id = ?', [key], function(errr, result) {
//                        connection.end();

                            if (!errr){
                                if (result.length == 0) {
                                        console.log("No product discount");
//                                    if ( pool._freeConnections.indexOf(connection) == -1 );
//                                            connection.release();
                                }else{
//                                        if ( pool._freeConnections.indexOf(connection) == -1 );
//                                            connection.release();
                                        console.log("Special update successfully!");
                                }
                            }
                            else{
                                console.log('Error while performing Query errr.' + errr);

//                                if ( pool._freeConnections.indexOf(connection) == -1 );
//                                    connection.release();
                            }

                    });

                }
                 
                 
            }
//    });
    


    currentNumberOfSegments = currentNumberOfSegments + 1;

    if ( currentNumberOfSegments < arrData.length ){
        downloadSegm( currentNumberOfSegments );
    }else{
        
//        for ( let i=0; i < arrJan.length; i++){
//            if ( !mapTmp.includes( arrJan[i] )){
//                
//                    connection.query('UPDATE mdvdoc_product SET quantity = 0, stock_status_id = 5 WHERE jan = ?', arrJan[i], function(err, result) {
//
//                        if (!err){
//                            if (result.length == 0) {
//                                console.log("Don`t find results in query to mySql in update not fined products!");
//                            }else{
//
//                            }
//                          }
//                        else{    
//                            console.log('Error while performing Query in update not fined products!' +  arrJan[i]);
//                        }
//                        
//                    });
//            }
//        }
        
        connection.end();
        console.log("Database connection closed");
        console.log("Done!");
        
    }         
}
    
//pool.on('enqueue', function () {
//  console.log('Waiting for available connection slot');
//downloadSegm( currentNumberOfSegments );
//});

function validateOptionsHost(host){
    
      let regularExpValidateHost = /\//;
      let regularExpValidateHostProtocol = /http:\/\//;
    
      if ( regularExpValidateHostProtocol.test( host ) ){
          
//            console.log("This host not validated - has http://: " + host);
            host =  host.replace(regularExpValidateHostProtocol, '');
      }
    
      if ( regularExpValidateHost.test( host ) ){
//            console.log("This host not validated: " + host);
//            console.log("It changed to: " + host.replace(regularExpValidateHost, ''));
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

console.log('Server running on port 8080');
    
//export data
module.exports.mapTmp = mapTmp;
module.exports.prod_id = prod_id;
module.exports.dataMap = dataMap;
module.exports.currentNumberOfSegments = currentNumberOfSegments;
module.exports.downloadSegm = downloadSegm;
module.exports.tmpcounter = tmpcounter;
    

}




