## MCLA Widget Proxy

This repo mirrors `mcla.us` widget interface to allow placement of a schedule or other widget onto a website, but importantly, it uses AWS Lambda to serve over HTTPS.

It avoids security issues by sanitizing the HTML and removing any non-whitelisted tags and/or scripts before serving it up to a potential site (so no man in the middle attack could occur).
