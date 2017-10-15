import http.client
import time
import json
import numpy as np
conn = http.client.HTTPConnection("localhost:8080")
conn.request("PUT", "/drive/pivot/-20")
for i in range(1,60):
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

    print("lon", json_gps["lon"], "lat", json_gps["lat"], "head",json_gps["head"], head )  # original in sim -79.46540990990992 43.78199009009009
    time.sleep(0.5)
#---------------------------------------------------------------------------------------

#conn.request("PUT", "/drive/speed/1")
