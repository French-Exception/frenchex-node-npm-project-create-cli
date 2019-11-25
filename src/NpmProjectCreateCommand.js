"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs-extra');
const rimraf = (() => {
    const _rimraf = require('rimraf');
    return (_path) => {
        return new Promise((resolve, reject) => {
            _rimraf(_path, (e) => {
                if (e)
                    return reject(e);
                return resolve();
            });
        });
    };
})();
const mkdirp = require('mkdirp');
const cp = require('child-process-promise');
class NpmProjectCreateCommand {
    constructor(logger) {
        this.logger = logger;
    }
    run(args) {
        const self = this;
        const absoluteFullPathScoped = path.join(args.rootPath, (args.scope ? '@' + args.scope : ''), args.name);
        return Promise.resolve()
            .then(() => {
            return self.destroyAndCreateScopeDir(args.destroyBefore, absoluteFullPathScoped);
        })
            .then(() => {
            return self.npmInit(args.npmBin, absoluteFullPathScoped, args.name, args.scope);
        })
            .catch((e) => {
            self.logger.error(e);
            process.exit(1);
        })
            .then(() => {
            return self.npmInstall(args.npmBin, absoluteFullPathScoped, args.install, args.devInstall);
        })
            .then(() => {
            return self.gitInit(args.gitBin, absoluteFullPathScoped);
        })
            .then(() => {
            return self.gitFlowInit(args.gitBin, absoluteFullPathScoped);
        })
            .then(() => {
            return self.updatePackageJson();
        });
    }
    trace(...args) {
        this.logger.trace.apply(this.logger, args);
    }
    debug(...args) {
        this.logger.debug.apply(this.logger, args);
    }
    info(...args) {
        this.logger.info.apply(this.logger, args);
    }
    warn(...args) {
        this.logger.warn.apply(this.logger, args);
    }
    error(...args) {
        this.logger.error.apply(this.logger, args);
    }
    fatal(...args) {
        this.logger.fatal.apply(this.logger, args);
    }
    destroyAndCreateScopeDir(destroyBefore, absScopedPath) {
        const self = this;
        const absScopedPathNorm = path.normalize(absScopedPath);
        self.logger.trace('destroyAndCreateScopeDir start');
        return Promise.resolve()
            .then(() => {
            let exists = false;
            try {
                fs.access(absScopedPathNorm, fs.W_OK);
                exists = true;
            }
            catch (e) {
                exists = false;
            }
            return { path: absScopedPathNorm, exists: exists };
        })
            .catch(() => {
            return { path: absScopedPathNorm, exists: false };
        })
            .then((input) => {
            self.logger.trace('destroyAndCreateScopeDir exists ?', input);
            return new Promise((resolve, reject) => {
                if (destroyBefore && input.exists) {
                    rimraf(input.path)
                        .catch((e) => {
                        self.debug('destroyAndCreateScopeDir', e);
                        return resolve(input);
                    });
                }
                resolve(input);
            });
        })
            .then((input) => {
            return new Promise((resolve, reject) => {
                if (!input.path || destroyBefore) {
                    mkdirp(input.path, (e) => {
                        if (e)
                            return resolve(e);
                        return resolve();
                    });
                }
                else {
                    resolve();
                }
            });
        });
    }
    gitFlowInit(gitBin, path) {
        const _gitFlowInit = cp.spawn(gitBin, ['flow', 'init', '-d'], {
            cwd: path,
            stdio: 'inherit'
        });
        return _gitFlowInit;
    }
    gitCheckoutBranch(gitBin, branch, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const _gitCheckout = cp.spawn(gitBin, ['checkout', '-b', branch], {
                cwd: path,
                stdio: 'inherit'
            });
            return _gitCheckout;
        });
    }
    gitInit(gitBin, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const _gitInit = cp.spawn(gitBin, ['init'], {
                cwd: path,
                stdio: 'inherit'
            });
            return _gitInit;
        });
    }
    npmInit(npmBin, path, name, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = ['init', '-y'];
            const _npmInit = cp.spawn(npmBin, args, {
                cwd: path,
                stdio: 'inherit'
            });
            return _npmInit;
        });
    }
    _npmInstall(npmBin, absFilePath, toInstall, dev) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = [(dev ? '--save-dev' : '--save'), 'install'].concat(toInstall);
            console.log('_npmInstall', toInstall, npmBin, args);
            const _npmInstall = yield cp.spawn(npmBin, args, {
                cwd: absFilePath,
                stdio: 'inherit'
            });
        });
    }
    npmInstall(npmBin, absFilePath, toInstall, devToInstall) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._npmInstall(npmBin, absFilePath, toInstall, false)
                .then(() => {
                return this._npmInstall(npmBin, absFilePath, devToInstall, true);
            });
        });
    }
    updatePackageJson() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.NpmProjectCreateCommand = NpmProjectCreateCommand;
//# sourceMappingURL=NpmProjectCreateCommand.js.map