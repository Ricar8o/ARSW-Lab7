var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (num) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+ num, function (eventbody) {
                var obj =JSON.parse(eventbody.body);
                var canvas = document.getElementById("canvas");
                var ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 1, 0, 2 * Math.PI);
                ctx.stroke();
            });
            stompClient.subscribe('/topic/newpolygon.'+ num, function (eventbody) {
                var obj =JSON.parse(eventbody.body);
                dibujar(obj);
            });
        });
        
    };

    var dibujar = function(points){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        for(var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x,points[i].y); 
          };
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
        },

        publishPoint: function(px,py,num){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt+ "in the topic "+num);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/app/newpoint."+num, {}, JSON.stringify(pt)); 
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        connect: function(num){
            connectAndSubscribe(num);
        }
    };

})();