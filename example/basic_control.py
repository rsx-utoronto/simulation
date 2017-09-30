import http.client
import time
import json
import numpy as np
target_lon = -78 #right increase 0.0001 -> 2 meter,    # original in sim: lon -79.46540990990992 lat 43.78199009009009
target_lat = 42.5 # up decrease 0.00001-> 1 meter
move2goal = 0
clearance = 6 #meter
cl_side = 7
angle_tol = 5
momentum = 3 #meter
speed =1 
pivot_speed = 20 # deg/sec


#if head > 5:
#    conn = http.client.HTTPConnection("localhost:8080")
#    conn.request("PUT", "/drive/pivot/-20")
#    time.sleep((abs(head)-0)/20)
#    conn = http.client.HTTPConnection("localhost:8080")
#    conn.request("PUT", "/drive/stop")
#elif head <-5:
#    conn = http.client.HTTPConnection("localhost:8080")
#    conn.request("PUT", "/drive/pivot/20")
#    time.sleep((abs(head)-0)/20)
#    conn = http.client.HTTPConnection("localhost:8080")
#    conn.request("PUT", "/drive/stop")

for i in range(1,20):
#--------------------------------------------------------------------------
#get GPS
    conn = http.client.HTTPConnection("localhost:8080")
    conn.request("GET", "/gps")
    r_gps = conn.getresponse()
    gps_string = r_gps.read().decode('utf-8')
    json_gps = json.loads(gps_string)
    head = float(json_gps["head"])  # CW positive
    # ------------------------------------------------------------------------------------
    # only for simulation,comment it out for real robot
    if head > 90:
        head = -(270-head)
    else:
        head += 90
    # ------------------------------------------------------------------------------------
    #CW positive, CCW negative
    x = target_lon - json_gps["lon"]
    y = target_lat - json_gps["lat"]
    print(json_gps["lon"],json_gps["lat"]) 
    if x > 0 and y > 0:  # -,-
        target_angle = np.degrees(np.arctan(abs(x) / abs(y)))
    elif x > 0 and y <= 0:  # -,+
        target_angle = 90 + np.degrees(np.arctan(abs(y) / abs(x)))
    elif x <= 0 and y > 0:  # +,-
        target_angle = -np.degrees(np.arctan(abs(x) / abs(y)))
    elif x <= 0 and y <= 0:  # +,+
        target_angle = -90 - np.degrees(np.arctan(abs(x) / abs(y)))
#--------------------------------------------------------------------------
    conn = http.client.HTTPConnection("localhost:8080")
    conn.request("GET", "/lidar")
    r1 = conn.getresponse()
    r1_string = r1.read().decode('utf-8')
    json_obj = json.loads(r1_string)
    minVal = 10 
    maxVal = 10
    min_side = 10
    for j in range(-15,16):
        j = str(j)
#        print(json_obj[j]) # example usage
        if float(json_obj[j]) < minVal and int(json_obj[j]) >0 :
            minVal = float(json_obj[j])  
        if int(json_obj[j]) > maxVal and int(json_obj[j]) >0 :
            maxVal = int(json_obj[j])
    for j in range(-30, -15):
        j = str(j)
            #        print(json_obj[j]) # example usage
        if float(json_obj[j]) < min_side and int(json_obj[j]) > 0:
            min_side = float(json_obj[j])
    for j in range(15, 30):
        j = str(j)
            #        print(json_obj[j]) # example usage
        if float(json_obj[j]) < min_side and int(json_obj[j]) > 0:
            min_side = float(json_obj[j])
    if minVal > clearance:
        if min_side < cl_side:
            move2goal = 3 #straight, along the wall and 3 m more
        elif abs(target_angle - head)< angle_tol:
            move2goal = 2 #straight to goal
        else:
            move2goal = 1 #head to goal direction
    if minVal <= clearance:
        move2goal = 0 # left turn
    print(r1_string, "x", x, "y", y, "head", head, "target_angle", target_angle, "target - head",
    target_angle - head)

#------------------------------------------------------------------------------------
#move to goal
    if move2goal == 1:
        if abs(target_angle - head) < 180:
            if target_angle > head:
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/pivot/20")
                time.sleep((abs(target_angle - head))/pivot_speed)
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/stop")
            else:
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/pivot/-20")
                time.sleep((abs(target_angle - head))/pivot_speed)
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/stop")
        if abs(target_angle - head) > 180:
            if target_angle > head:
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/pivot/-20")   #turn left
                time.sleep((360-abs(target_angle - head))/pivot_speed)
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/stop")
            else:
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/pivot/20")    #turn right
                print(abs(target_angle - head))
                time.sleep((360-abs(target_angle - head))/pivot_speed)
                conn = http.client.HTTPConnection("localhost:8080")
                conn.request("PUT", "/drive/stop")
    elif move2goal == 0: # turn left
        conn = http.client.HTTPConnection("localhost:8080")
        conn.request("PUT", "/drive/pivot/-20")
        time.sleep((30) / pivot_speed)
       # conn = http.client.HTTPConnection("localhost:8080")
       # conn.request("PUT", "/drive/speed/1")
        #time.sleep(momentum/1)
       # conn = http.client.HTTPConnection("localhost:8080")
        #conn.request("PUT", "/drive/stop")
    elif move2goal == 2:
        conn = http.client.HTTPConnection("localhost:8080")
        conn.request("PUT", "/drive/speed/1")
        time.sleep(1/speed)
    elif move2goal == 3:
        for k in range (1,10):
            conn = http.client.HTTPConnection("localhost:8080")
            conn.request("GET", "/lidar")
            r1 = conn.getresponse()
            r1_string = r1.read().decode('utf-8')
            json_obj = json.loads(r1_string)
            minVal = 10 
            for j in range(-15,16):
                j = str(j)
#                print(json_obj[j]) # example usage
                if float(json_obj[j]) < minVal and int(json_obj[j]) >0 :
                    minVal = float(json_obj[j])  
                if minVal > 2: 
                    conn = http.client.HTTPConnection("localhost:8080")
                    conn.request("PUT", "/drive/speed/1") 
                    time.sleep((3/speed)/10)
                elif minVal <2:
                    conn = http.client.HTTPConnection("localhost:8080")
                    conn.request("PUT", "/drive/pivot/-20")
                    time.sleep((30) / pivot_speed)
                    conn = http.client.HTTPConnection("localhost:8080")
                    conn.request("PUT", "/drive/stop")
                    
        

#---------------------------------------------------------------------------------------

    

#conn.request("PUT", "/drive/speed/1")
