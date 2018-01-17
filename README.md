# electron-download-interrupt-bug

```bash
git clone https://github.com/pfrazee/electron-download-interrupt-bug
cd electron-download-interrupt-bug
npm install
npm start
```

You will see two dialogs telling you how the download of `https://github.com/index.html` and `custom://foo.com/index.html` went. The https download succeeds but the custom download seems to always fail.