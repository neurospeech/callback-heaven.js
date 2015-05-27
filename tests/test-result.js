function testVM(){
        var country;
        var i;
        var countries;
        return avm(this, [["async",
                        [(function (){
                                        return $.get('/countries');
                                })]
                        ,
                        function (__v1){
                                countries = __v1;
                        }]
                ,
                ["for",
                        {
                                "init": (function (){
                                        return i = 0;
                                }),
                                "test": (function (){
                                        return i < countries.length;
                                }),
                                "update": (function (){
                                        return i++;
                                }),
                                "body": [(function (){
                                                country = countries[i];
                                        }),
                                        ["async",
                                                [(function (){
                                                                return $.get('/countries/' + country.code);
                                                        })]
                                                ,
                                                function (__v1){
                                                        country.states = __v1;
                                                }]
                                        ]

                        }]
                ,
                (function (){
                        console.log(JSON.stringify(countries));
                })]
        );
}