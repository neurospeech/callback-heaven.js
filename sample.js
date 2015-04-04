(function(a){
	
	var r = $ap($.get('/url/'));
	
})();

(function(){
	
	try{
		var r = $ap($.get('/url/'));
		if(r){
			var a = 5 + 6;
		}
	}catch(e){
		console.log(e);
	}
	
})();