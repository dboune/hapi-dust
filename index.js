// Load modules

var Dust;
var Hoek = require('hoek');

// Declare internals

var internals = {};

internals.defaults = {
    dust: 'dustjs-linkedin'
};

internals.render = function (tmpl) {

    return function (context, options, callback) {

        if (options.streaming) {
            var stream;

            try {
                stream = tmpl(context);
            } catch (err) {
                return callback(err, null);
            }

            return callback(null, stream);
        }

        return tmpl(context, callback);
    };
};

// Engine

var HapiDust = function () {

    if (!(this instanceof HapiDust)) {
        return new HapiDust();
    }

    this.module.config = internals.defaults;

    this.compileMode = 'async';

};

HapiDust.prototype.setConfig = function (config) {

    this.module.config = Hoek.applyToDefaults(this.module.config, config);

    return this;
};

HapiDust.prototype.module = {};

HapiDust.prototype.module.prepare = function (config, next) {

    if (config.compileMode !== 'async') {
        return next(new Error('compileMode must be async for hapi-Dust'));
    }

    if (Dust === undefined) {
        try {

            Dust = require(this.config.dust);
        } catch (e) {
            return next(e);
        }
    }

    return next();
};

HapiDust.prototype.module.compile = function (template, options, callback) {

    var tmpl;

    try {
        tmpl = Dust.compileFn(template, options.filename);
    } catch (err) {

        return callback(err, null);
    }

    var renderFn = internals.render(tmpl);

    return callback(null, renderFn);
};

HapiDust.prototype.module.registerPartial = function (name, src) {

    return Dust.compileFn(src, name);
};

HapiDust.prototype.module.registerHelper = function (name, helper) {

    if (helper.length > 1) {
        Dust.helpers[name] = helper;
    } else {
        Dust.filters[name] = helper;
    }
};

exports = module.exports = HapiDust();
