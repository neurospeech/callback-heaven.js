    function testVM(){
        var countries = $wait($.get('/countries'));
        for(var i=0; i<countries.length; i++){
            var country = countries[i];
            country.states = $wait($.get('/countries/' + country.code));
        }
        console.log(JSON.stringify(countries));
    }