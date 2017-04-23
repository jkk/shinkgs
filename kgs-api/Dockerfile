FROM java:8-jdk
LABEL name "kgs-api"
MAINTAINER Justin Kramer <jkkramer@gmail.com>

# Install packages
RUN apt-get update && \
    apt-get update --fix-missing

# Download and install jetty
ENV JETTY_HOME /opt/jetty
ENV JETTY_BASE /opt/jetty
ENV JETTY_VERSION 9.3.0
ENV RELEASE_DATE v20150612
RUN curl -O http://archive.eclipse.org/jetty/${JETTY_VERSION}.${RELEASE_DATE}/dist/jetty-distribution-${JETTY_VERSION}.${RELEASE_DATE}.tar.gz && \
    tar -xzvf jetty-distribution-${JETTY_VERSION}.${RELEASE_DATE}.tar.gz && \
    rm -rf jetty-distribution-${JETTY_VERSION}.${RELEASE_DATE}.tar.gz && \
    mv jetty-distribution-${JETTY_VERSION}.${RELEASE_DATE}/ ${JETTY_HOME}

# Configure Jetty user and clean up install
RUN useradd jetty && \
    chown -R jetty:jetty ${JETTY_HOME} && \
    rm -rf ${JETTY_HOME}/webapps.demo

# Configure Jetty
WORKDIR ${JETTY_HOME}
RUN java -jar start.jar --add-to-start=ext
RUN java -jar start.jar --add-to-startd=http,deploy

# Install org.json
WORKDIR ${JETTY_HOME}/lib/ext
RUN curl -O http://central.maven.org/maven2/org/json/json/20160212/json-20160212.jar

# Install KGS Protocol Translator
WORKDIR ${JETTY_HOME}/webapps
RUN curl -O http://www.igoweb.org/~wms/kgs/jsonClient-2016-09-17T21_43Z.war && \
    mv jsonClient-2016-09-17T21_43Z.war ROOT.war

EXPOSE 8080

WORKDIR ${JETTY_HOME}
CMD ["java", "-jar", "start.jar", "jetty.home=/opt/jetty"]
