'use strict';

var fs = require('fs')
    , path = require('path')
    , Promise = require('bluebird')
    , debug = require('debug')('ghost:storage:alioss')
    , OSS = require('ali-oss').Wrapper
    , StorageBase = require('ghost-storage-base');

const cwd = process.cwd();
let ghostRoot;

if (fs.existsSync(path.join(cwd, 'core'))) {
    ghostRoot = cwd;
} else if (fs.existsSync(path.join(cwd, 'current'))) {
    // installed via ghost cli
    ghostRoot = path.join(cwd, 'current');
}

if (!ghostRoot) {
    throw new Error('Can not get ghost root path!');
}

const utils = require(path.join(ghostRoot, 'core/server/utils'));

class AliOssStore extends StorageBase{
    constructor(config) {
        super();

        this.options = config || {};
        debug('client config: ', this.options);
        this.client = new OSS(this.options);
    }

    save(file, targetDir) {
        var client = this.client;
        var origin = this.options.origin;
        var key = convertFilePathToWebUriPath(this.generateFileKey(file, targetDir));

        var fileKey = this.options.fileKey || {}
            , headers = this.options.headers || {};

        var styleParams = ''
        if(fileKey.style){
            styleParams = '?x-oss-process=style/' + fileKey.style
        }

        return new Promise(function (resolve, reject) {
            const options = {}
                , contentDisposition = headers.contentDisposition !== undefined ? headers.contentDisposition : 'inline'; //default inline mode

            //if contentDisposition is false, disable Content-Disposition Header
            if(contentDisposition){
                options.headers = {
                    //set downloading file's name
                    "Content-Disposition": contentDisposition + ";filename=" + encodeURIComponent(path.basename(file.name))
                }
            }

            return client.put(
                key,
                fs.createReadStream(file.path),
                options
            )
                .then(function (result) {
                    debug('save file success, return data:', result);
                    if(origin){
                        resolve(origin + path.join('/' + result.name) + styleParams)
                    }else{
                        resolve(result.url)
                    }
                })
                .catch(function (err) {
                    debug('save file error:', err);
                    reject(false)
                })
        })
    }

    exists(filename, fileDir) {
        var client = this.client
            , fileKey = convertFilePathToWebUriPath(this.getFullFileName(filename, fileDir));

        return new Promise(function (resolve, reject) {
            return client.head(fileKey).then(function (result) {
                debug('load file meta info:', result);
                resolve(true)
            }).catch(function (err) {
                debug('load file meta error:', err);
                reject(false)
            })
        })
    }

    serve(options) {
        return function (req, res, next) {
            next();
        }
    }

    delete(filename) {
        var client = this.client;

        return new Promise(function (resolve, reject) {
            return client.delete(filename).then(function (result) {
                debug('delete file success:', filename);
                resolve(true)
            }).catch(function (err) {
                debug('delete file error:', err);
                reject(false)
            })
        })
    }

    /**
     * Not implemented.
     * @returns {Promise.<*>}
     */
    read() {
        return Promise.reject('alioss read not implemented');
    }

    generateFileKey(file, targetDir){
        var fileKeyConfig = this.options.fileKey || {}
            , suffix = fileKeyConfig.suffix || ''
            , extName = path.extname(file.name);

        var fileName = getRandomFileName(fileKeyConfig) + extName.toLowerCase();
        return this.getFullFileName(fileName, targetDir);
    }

    getFullFileName(fileName, targetDir) {
        var fileKeyConfig = this.options.fileKey || {}
            , prefix = fileKeyConfig.prefix || '';

        targetDir = this.getTargetDir(targetDir);

        return path.join(prefix, targetDir, fileName);
    }
}

//https://github.com/stevemao/left-pad
function leftpad(str, len, ch) {
    str = String(str);

    var i = -1;

    if (!ch && ch !== 0) ch = ' ';

    len = len - str.length;

    while (++i < len) {
        str = ch + str;
    }

    return str;
}

/**
 * create random the uploadFile name
 * @param opt  name config, support prefix & suffix
 */
function getRandomFileName(opt) {
    opt = opt || {};
    var curTime = new Date()
        , connector = opt.connector || '_'
        , key = leftpad(Math.round(Math.random() * 99999), 5, 0);

    return curTime.getTime() + connector + key;
}

function convertFilePathToWebUriPath(fileName){
    return fileName.replace(new RegExp('\\' + path.sep, 'g'), '/')
}

module.exports = AliOssStore;
