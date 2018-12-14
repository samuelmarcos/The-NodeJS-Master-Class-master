var fetchUrl = require("fetch").fetchUrl;

function lerJSON2(){
    let novo;
    try{
        return new Promise((resolve,reject)=>{
            fetchUrl("https://storage.googleapis.com/dito-questions/events.json",function(error, meta, body){
            novo = body.toString();
            resolve(novo);
    });
        });

    }catch(err){
        reject(err);
    }
}


lerJSON2().then(conteudo => {
	console.log(conteudo)
});

console.log('TEM QUE VIR DEPOIS'); // esse comentario aparece antes que o conteudo do json


/* saida:

TEM QUE VIR DEPOIS
{"events":[{"event":"comprou-produto","timestamp":"2016-09-22T13:57:32.2311892-03:00","custom_data":[{"key":"product_name","value":"Camisa Azul"},{"key":"transaction_id","value":"3029384"},{"key":"product_price","value":100}]},{"event":"comprou","timestamp":"2016-09-22T13:57:31.2311892-03:00","revenue":250,"custom_data":[{"key":"store_name","value":"Patio Savassi"},{"key":"transaction_id","value":"3029384"}]},{"event":"comprou-produto","timestamp":"2016-09-22T13:57:33.2311892-03:00","custom_data":[{"key":"product_price","value":150},{"key":"transaction_id","value":"3029384"},{"key":"product_name","value":"Calça Rosa"}]},{"event":"comprou-produto","timestamp":"2016-10-02T11:37:35.2300892-03:00","custom_data":[{"key":"transaction_id","value":"3409340"},{"key":"product_name","value":"Tenis Preto"},{"key":"product_price","value":120}]},{"event":"comprou","timestamp":"2016-10-02T11:37:31.2300892-03:00","revenue":120,"custom_data":[{"key":"transaction_id","value":"3409340"},{"key":"store_name","value":"BH Shopping"}]}]}

*/