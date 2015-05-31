    function testVM(){
        try{
            
            var countries = $wait($.get('/countries'));
            for(var i=0; i<countries.length; i++){
                var country = countries[i];
                country.states = $wait($.get('/countries/' + country.code));
            }
            console.log(JSON.stringify(countries));
        }catch(e){
            console.log(e);
        }finally{
            console.log('something went wrong');
        }
    }