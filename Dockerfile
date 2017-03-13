FROM
MAINTAINER jingsam <jing-sam@qq.com>

RUN apt-get update -qq \
&& apt-get install -y xfvb \
&& apt-get clean



VOLUME /data
WORKDIR /data
