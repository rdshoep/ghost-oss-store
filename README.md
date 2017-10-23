# Ghost Aliyun OSS Storage

> It's for Ghost@1.*

This [Ghost custom storage module](https://github.com/TryGhost/Ghost/wiki/Using-a-custom-storage-module) allows you to store media file with [Aliyun OSS](https://cn.aliyun.com/product/oss) instead of storing at local machine.

### Difference between 'ghost-oss-store'
Random the uploaded file's name, and set Content-Disposition to hold the original name

## Installation

### Via NPM(not suitable for ghost-cli)

- Install Oss storage module

  ```
  npm install ghost-storage-alioss
  ```
  
- Make the storage folder if it doesn't exist yet

  ```
  mkdir content/adapters/storage
  ```
  
- Create `alioss.js` file and export the ghost-storage-alioss module

  ```
  module.exports = require('ghost-storage-alioss')
  ```

### Via Git

In order to replace the storage module, the basic requirements are:

- Create a new folder inside `/content/adapters` called `/storage`

- Clone this repo to `/storage`

  ```
  cd [path/to/ghost]/content/adapters/storage
  mkdir alioss && cd alioss
  git clone https://github.com/rdshoep/ghost-storage-alioss ./
  ```

- Install dependencies

  ```
  npm install
  ```

## Configuration

In your `config.js` file, you'll need to add a new `storage` block to whichever environment you want to change:

```javascript
storage: {
  active: 'alioss',
  'alioss': {
    accessKeyId: 'accessKeyId',
    accessKeySecret: 'accessKeySecret',
    bucket: 'bucket',
    region: 'oss-cn-hangzhou',
    origin: 'http(s)://your-cdn-domain.com', // if you have bind custom domain to oss bucket. or false             
    fileKey: {
      prefix: 'ghost/',  // {String | Function} will be formated by moment.js, using `[]` to escape,
      suffix: '' // {String | Function} string added before file extname.
    }
  }
}
```

## Todos
- [ ] minify the requested image file

## License
MIT