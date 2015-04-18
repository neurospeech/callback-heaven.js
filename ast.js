var ast = (function(){
  
	function isString(stringToCheck){
	  if(stringToCheck.constructor == String)
	    return true;
	  return typeof stringToCheck == 'string' || stringToCheck instanceof String;
	}
	
	
	if(!AtomEnumerator){
		var AtomEnumerator = function(a){
			this.array = a;
			this.index = -1;
		};

		AtomEnumerator.prototype = {
			next: function(){
				this.index++;
				return this.index < this.array.length;
			},
			current: function(){
				return this.array[this.index];
			},
			currentIndex: function(){
			  return this.index;
			}
		};
	}
	
	
  
  
});