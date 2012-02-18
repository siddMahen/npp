# Benchmarking npp

Apache benchmark results running `node simple.js`
on a 2007 Macbook (OSX Snow Leopard).

<pre>
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Total of 66303 requests completepacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 10000 requests
Completed 20000 requests
Completed 30000 requests
Completed 40000 requests
Completed 50000 requests
Completed 60000 requests
Completed 70000 requests
Completed 80000 requests
Completed 90000 requests
Completed 100000 requests
Finished 100000 requests


Server Software:        
Server Hostname:        localhost
Server Port:            8000

Document Path:          /
Document Length:        6471 bytes

Concurrency Level:      200
Time taken for tests:   186.160 seconds
Complete requests:      100000
Failed requests:        5
   (Connect: 5, Receive: 0, Length: 0, Exceptions: 0)
Write errors:           0
Total transferred:      650900000 bytes
HTML transferred:       647100000 bytes
Requests per second:    537.17 [#/sec] (mean)
Time per request:       372.320 [ms] (mean)
Time per request:       1.862 [ms] (mean, across all concurrent requests)
Transfer rate:          3414.51 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0  254 758.7      0   19039
Processing:     2  113 139.6     54     994
Waiting:        0  111 139.0     52     992
Total:          2  367 755.6     98   19054

Percentage of the requests served within a certain time (ms)
  50%     98
  66%    234
  75%    397
  80%    561
  90%   1019
  95%   1108
  98%   2020
  99%   4031
 100%  19054 (longest request)
</pre>

Apache benchmark results running the following php code:

```php
<html>
    <head>
    </head>
    <body>
        <?php echo "<p>Hello World!</p>" ?>
    </body>
</html>
```

On a 2010 iMac (OSX Lion).

Do note that this has been tested with a concurrency level of 100 rather than 
200.

<pre>
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 10000 requests
Completed 20000 requests
Completed 30000 requests
Completed 40000 requests
Completed 50000 requests
Completed 60000 requests
Completed 70000 requests
Completed 80000 requests
Completed 90000 requests
Completed 100000 requests
Finished 100000 requests


Server Software:        Apache/2.2.21
Server Hostname:        localhost
Server Port:            80

Document Path:          /simple.php
Document Length:        70 bytes

Concurrency Level:      100
Time taken for tests:   200.692 seconds
Complete requests:      100000
Failed requests:        0
Write errors:           0
Total transferred:      38128194 bytes
HTML transferred:       7005180 bytes
Requests per second:    498.28 [#/sec] (mean)
Time per request:       200.692 [ms] (mean)
Time per request:       2.007 [ms] (mean, across all concurrent requests)
Transfer rate:          185.53 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0  192 1523.8     56   20042
Processing:     0    8  22.2      5     288
Waiting:        0    0   3.1      0     152
Total:          0  200 1523.7     62   20051

Percentage of the requests served within a certain time (ms)
  50%     62
  66%     66
  75%     69
  80%     71
  90%    169
  95%    227
  98%    258
  99%   1108
 100%  20051 (longest request)
</pre>
