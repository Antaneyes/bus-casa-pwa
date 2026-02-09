# Dockerfile para Bus Casa PWA
FROM nginx:1.27-alpine

# Copiar archivos de la aplicación
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY main.js /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY icon-192.png /usr/share/nginx/html/
COPY icon-512.png /usr/share/nginx/html/

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
