FROM ubuntu:16.04
RUN mv /etc/apt/sources.list /etc/apt/sources.list.bak && \
    echo "deb-src http://archive.ubuntu.com/ubuntu xenial main restricted" >/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial main restricted" >>/etc/apt/sources.list && \
    echo "deb-src http://mirrors.aliyun.com/ubuntu/ xenial main restricted multiverse universe" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted" >>/etc/apt/sources.list && \
    echo "deb-src http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted multiverse universe" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial universe" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-updates universe" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial multiverse" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-updates multiverse" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse" >>/etc/apt/sources.list && \
    echo "deb-src http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse" >>/etc/apt/sources.list && \
    echo "deb http://archive.canonical.com/ubuntu xenial partner" >>/etc/apt/sources.list && \
    echo "deb-src http://archive.canonical.com/ubuntu xenial partner" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted" >>/etc/apt/sources.list && \
    echo "deb-src http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted multiverse universe" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-security universe" >>/etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-security multiverse" >>/etc/apt/sources.list
    
RUN apt-get update \
  && apt-get install -y \
  curl \
  unzip \
  git \
  build-essential \
  clang \
  make \
  pkg-config \
  wget \
  dh-autoreconf \
  libcapnp-dev \
  libsqlite3-dev \
  libbz2-dev \
  libffi-dev \
  libssl-dev \
  libzmq5-dev

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y openjdk-8-jdk openjdk-8-jre android-sdk nodejs yarn

WORKDIR /tmp

ENV HOME=/root
ENV PYENV_ROOT $HOME/.pyenv
ENV PATH $PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH
RUN curl https://pyenv.run | bash \
    && pyenv install 3.7.3 \
    && pyenv global 3.7.3 \
    && pyenv rehash
RUN pip3 install pyyaml==5.1.2 Cython==0.29.14 scons==3.1.1 pycapnp==0.6.4

ENV ANDROID_HOME=/usr/lib/android-sdk
ENV PATH="$PATH:/usr/lib/android-sdk/tools/bin"

# install Android SDK Tools
RUN curl -o sdk-tools.zip "https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip" && \
    unzip -o sdk-tools.zip -d "/usr/lib/android-sdk/" && \
    chmod +x /usr/lib/android-sdk/tools/bin/*

RUN yes | sdkmanager "platform-tools" "platforms;android-23" "platforms;android-27" "extras;android;m2repository" "extras;google;m2repository" "ndk-bundle"

# install capnpc-java
RUN git clone https://github.com/capnproto/capnproto-java.git && cd capnproto-java && make && cp capnpc-java /usr/local/bin/

# install capnp
RUN curl -s https://raw.githubusercontent.com/commaai/cereal/master/install_capnp.sh | bash -

COPY ./../../wepilot/phonelibs/install_capnp.sh /tmp/install_capnp.sh
RUN /tmp/install_capnp.sh
# apk time
RUN mkdir -p /tmp/openpilot/apks
WORKDIR /tmp/openpilot/apks

