package edu.eci.arsw.collabpaint.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class STOMPMessagesHandler {
	
	@Autowired
	SimpMessagingTemplate msgt;

	HashMap <String, ArrayList<Point>> poligonos = new HashMap<>();
	ArrayList<Point> a = new ArrayList<>();
    
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
		System.out.println("Nuevo punto recibido en el servidor!:"+pt);
		msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
		synchronized(poligonos){
			if (poligonos.containsKey(numdibujo)){
				a = poligonos.get(numdibujo);
				a.add(pt);
				if (a.size() > 3){
					msgt.convertAndSend("/topic/newpolygon." + numdibujo, a);
				}
			}
			else{
				a.clear();
				a.add(pt);
				poligonos.put(numdibujo, a);
			}
		}
	}
}