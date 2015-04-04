(function(a){
	for(var i=0;i<10;i++){
		var r = $ap($.get('/url/'));
	}
	
	do{
		console.log('a');
	}while(true);
	
	switch(a){
		case "a":
			console.log(a);
			break;
		default: 
			console.log('none');
	}
	
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