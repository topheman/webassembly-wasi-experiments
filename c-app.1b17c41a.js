// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"QVnC":[function(require,module,exports) {
var define;
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"Klds":[function(require,module,exports) {
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WASIKillError = exports.WASIExitError = exports.WASIError = exports.WASI = exports.default = void 0;

/*
 *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
*****************************************************************************/
function aa(a, b) {
  aa = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (a, b) {
    a.__proto__ = b;
  } || function (a, b) {
    for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
  };

  return aa(a, b);
}

function ba(a, b) {
  function c() {
    this.constructor = a;
  }

  aa(a, b);
  a.prototype = null === b ? Object.create(b) : (c.prototype = b.prototype, new c());
}

function ca(a) {
  var b = "function" === typeof Symbol && a[Symbol.iterator],
      c = 0;
  return b ? b.call(a) : {
    next: function () {
      a && c >= a.length && (a = void 0);
      return {
        value: a && a[c++],
        done: !a
      };
    }
  };
}

function da(a, b) {
  var c = "function" === typeof Symbol && a[Symbol.iterator];
  if (!c) return a;
  a = c.call(a);
  var d,
      e = [];

  try {
    for (; (void 0 === b || 0 < b--) && !(d = a.next()).done;) e.push(d.value);
  } catch (g) {
    var f = {
      error: g
    };
  } finally {
    try {
      d && !d.done && (c = a["return"]) && c.call(a);
    } finally {
      if (f) throw f.error;
    }
  }

  return e;
}

function fa() {
  for (var a = [], b = 0; b < arguments.length; b++) a = a.concat(da(arguments[b]));

  return a;
}

var ha = "undefined" !== typeof globalThis ? globalThis : "undefined" !== typeof global ? global : {},
    k = "undefined" !== typeof BigInt ? BigInt : ha.BigInt || Number,
    ia = DataView;
ia.prototype.setBigUint64 || (ia.prototype.setBigUint64 = function (a, b, c) {
  if (b < Math.pow(2, 32)) {
    b = Number(b);
    var d = 0;
  } else {
    d = b.toString(2);
    b = "";

    for (var e = 0; e < 64 - d.length; e++) b += "0";

    b += d;
    d = parseInt(b.substring(0, 32), 2);
    b = parseInt(b.substring(32), 2);
  }

  this.setUint32(a + (c ? 0 : 4), b, c);
  this.setUint32(a + (c ? 4 : 0), d, c);
}, ia.prototype.getBigUint64 = function (a, b) {
  var c = this.getUint32(a + (b ? 0 : 4), b);
  a = this.getUint32(a + (b ? 4 : 0), b);
  c = c.toString(2);
  a = a.toString(2);
  b = "";

  for (var d = 0; d < 32 - c.length; d++) b += "0";

  return k("0b" + a + (b + c));
});
var ja = "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {},
    m = [],
    u = [],
    ka = "undefined" !== typeof Uint8Array ? Uint8Array : Array,
    la = !1;

function ma() {
  la = !0;

  for (var a = 0; 64 > a; ++a) m[a] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[a], u["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(a)] = a;

  u[45] = 62;
  u[95] = 63;
}

function na(a, b, c) {
  for (var d = [], e = b; e < c; e += 3) b = (a[e] << 16) + (a[e + 1] << 8) + a[e + 2], d.push(m[b >> 18 & 63] + m[b >> 12 & 63] + m[b >> 6 & 63] + m[b & 63]);

  return d.join("");
}

function oa(a) {
  la || ma();

  for (var b = a.length, c = b % 3, d = "", e = [], f = 0, g = b - c; f < g; f += 16383) e.push(na(a, f, f + 16383 > g ? g : f + 16383));

  1 === c ? (a = a[b - 1], d += m[a >> 2], d += m[a << 4 & 63], d += "==") : 2 === c && (a = (a[b - 2] << 8) + a[b - 1], d += m[a >> 10], d += m[a >> 4 & 63], d += m[a << 2 & 63], d += "=");
  e.push(d);
  return e.join("");
}

function pa(a, b, c, d, e) {
  var f = 8 * e - d - 1;
  var g = (1 << f) - 1,
      h = g >> 1,
      l = -7;
  e = c ? e - 1 : 0;
  var n = c ? -1 : 1,
      r = a[b + e];
  e += n;
  c = r & (1 << -l) - 1;
  r >>= -l;

  for (l += f; 0 < l; c = 256 * c + a[b + e], e += n, l -= 8);

  f = c & (1 << -l) - 1;
  c >>= -l;

  for (l += d; 0 < l; f = 256 * f + a[b + e], e += n, l -= 8);

  if (0 === c) c = 1 - h;else {
    if (c === g) return f ? NaN : Infinity * (r ? -1 : 1);
    f += Math.pow(2, d);
    c -= h;
  }
  return (r ? -1 : 1) * f * Math.pow(2, c - d);
}

function qa(a, b, c, d, e, f) {
  var g,
      h = 8 * f - e - 1,
      l = (1 << h) - 1,
      n = l >> 1,
      r = 23 === e ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  f = d ? 0 : f - 1;
  var p = d ? 1 : -1,
      y = 0 > b || 0 === b && 0 > 1 / b ? 1 : 0;
  b = Math.abs(b);
  isNaN(b) || Infinity === b ? (b = isNaN(b) ? 1 : 0, d = l) : (d = Math.floor(Math.log(b) / Math.LN2), 1 > b * (g = Math.pow(2, -d)) && (d--, g *= 2), b = 1 <= d + n ? b + r / g : b + r * Math.pow(2, 1 - n), 2 <= b * g && (d++, g /= 2), d + n >= l ? (b = 0, d = l) : 1 <= d + n ? (b = (b * g - 1) * Math.pow(2, e), d += n) : (b = b * Math.pow(2, n - 1) * Math.pow(2, e), d = 0));

  for (; 8 <= e; a[c + f] = b & 255, f += p, b /= 256, e -= 8);

  d = d << e | b;

  for (h += e; 0 < h; a[c + f] = d & 255, f += p, d /= 256, h -= 8);

  a[c + f - p] |= 128 * y;
}

var ra = {}.toString,
    sa = Array.isArray || function (a) {
  return "[object Array]" == ra.call(a);
};

v.TYPED_ARRAY_SUPPORT = void 0 !== ja.TYPED_ARRAY_SUPPORT ? ja.TYPED_ARRAY_SUPPORT : !0;
var ta = v.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;

function w(a, b) {
  if ((v.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823) < b) throw new RangeError("Invalid typed array length");
  v.TYPED_ARRAY_SUPPORT ? (a = new Uint8Array(b), a.__proto__ = v.prototype) : (null === a && (a = new v(b)), a.length = b);
  return a;
}

function v(a, b, c) {
  if (!(v.TYPED_ARRAY_SUPPORT || this instanceof v)) return new v(a, b, c);

  if ("number" === typeof a) {
    if ("string" === typeof b) throw Error("If encoding is specified then the first argument must be a string");
    return va(this, a);
  }

  return wa(this, a, b, c);
}

v.poolSize = 8192;

v._augment = function (a) {
  a.__proto__ = v.prototype;
  return a;
};

function wa(a, b, c, d) {
  if ("number" === typeof b) throw new TypeError('"value" argument must not be a number');

  if ("undefined" !== typeof ArrayBuffer && b instanceof ArrayBuffer) {
    b.byteLength;
    if (0 > c || b.byteLength < c) throw new RangeError("'offset' is out of bounds");
    if (b.byteLength < c + (d || 0)) throw new RangeError("'length' is out of bounds");
    b = void 0 === c && void 0 === d ? new Uint8Array(b) : void 0 === d ? new Uint8Array(b, c) : new Uint8Array(b, c, d);
    v.TYPED_ARRAY_SUPPORT ? (a = b, a.__proto__ = v.prototype) : a = xa(a, b);
    return a;
  }

  if ("string" === typeof b) {
    d = a;
    a = c;
    if ("string" !== typeof a || "" === a) a = "utf8";
    if (!v.isEncoding(a)) throw new TypeError('"encoding" must be a valid string encoding');
    c = ya(b, a) | 0;
    d = w(d, c);
    b = d.write(b, a);
    b !== c && (d = d.slice(0, b));
    return d;
  }

  return za(a, b);
}

v.from = function (a, b, c) {
  return wa(null, a, b, c);
};

v.TYPED_ARRAY_SUPPORT && (v.prototype.__proto__ = Uint8Array.prototype, v.__proto__ = Uint8Array);

function Aa(a) {
  if ("number" !== typeof a) throw new TypeError('"size" argument must be a number');
  if (0 > a) throw new RangeError('"size" argument must not be negative');
}

v.alloc = function (a, b, c) {
  Aa(a);
  a = 0 >= a ? w(null, a) : void 0 !== b ? "string" === typeof c ? w(null, a).fill(b, c) : w(null, a).fill(b) : w(null, a);
  return a;
};

function va(a, b) {
  Aa(b);
  a = w(a, 0 > b ? 0 : Ba(b) | 0);
  if (!v.TYPED_ARRAY_SUPPORT) for (var c = 0; c < b; ++c) a[c] = 0;
  return a;
}

v.allocUnsafe = function (a) {
  return va(null, a);
};

v.allocUnsafeSlow = function (a) {
  return va(null, a);
};

function xa(a, b) {
  var c = 0 > b.length ? 0 : Ba(b.length) | 0;
  a = w(a, c);

  for (var d = 0; d < c; d += 1) a[d] = b[d] & 255;

  return a;
}

function za(a, b) {
  if (z(b)) {
    var c = Ba(b.length) | 0;
    a = w(a, c);
    if (0 === a.length) return a;
    b.copy(a, 0, 0, c);
    return a;
  }

  if (b) {
    if ("undefined" !== typeof ArrayBuffer && b.buffer instanceof ArrayBuffer || "length" in b) return (c = "number" !== typeof b.length) || (c = b.length, c = c !== c), c ? w(a, 0) : xa(a, b);
    if ("Buffer" === b.type && sa(b.data)) return xa(a, b.data);
  }

  throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}

function Ba(a) {
  if (a >= (v.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823)) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + (v.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823).toString(16) + " bytes");
  return a | 0;
}

v.isBuffer = Ca;

function z(a) {
  return !(null == a || !a._isBuffer);
}

v.compare = function (a, b) {
  if (!z(a) || !z(b)) throw new TypeError("Arguments must be Buffers");
  if (a === b) return 0;

  for (var c = a.length, d = b.length, e = 0, f = Math.min(c, d); e < f; ++e) if (a[e] !== b[e]) {
    c = a[e];
    d = b[e];
    break;
  }

  return c < d ? -1 : d < c ? 1 : 0;
};

v.isEncoding = function (a) {
  switch (String(a).toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "latin1":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      return !0;

    default:
      return !1;
  }
};

v.concat = function (a, b) {
  if (!sa(a)) throw new TypeError('"list" argument must be an Array of Buffers');
  if (0 === a.length) return v.alloc(0);
  var c;
  if (void 0 === b) for (c = b = 0; c < a.length; ++c) b += a[c].length;
  b = v.allocUnsafe(b);
  var d = 0;

  for (c = 0; c < a.length; ++c) {
    var e = a[c];
    if (!z(e)) throw new TypeError('"list" argument must be an Array of Buffers');
    e.copy(b, d);
    d += e.length;
  }

  return b;
};

function ya(a, b) {
  if (z(a)) return a.length;
  if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(a) || a instanceof ArrayBuffer)) return a.byteLength;
  "string" !== typeof a && (a = "" + a);
  var c = a.length;
  if (0 === c) return 0;

  for (var d = !1;;) switch (b) {
    case "ascii":
    case "latin1":
    case "binary":
      return c;

    case "utf8":
    case "utf-8":
    case void 0:
      return Da(a).length;

    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      return 2 * c;

    case "hex":
      return c >>> 1;

    case "base64":
      return Ea(a).length;

    default:
      if (d) return Da(a).length;
      b = ("" + b).toLowerCase();
      d = !0;
  }
}

v.byteLength = ya;

function Fa(a, b, c) {
  var d = !1;
  if (void 0 === b || 0 > b) b = 0;
  if (b > this.length) return "";
  if (void 0 === c || c > this.length) c = this.length;
  if (0 >= c) return "";
  c >>>= 0;
  b >>>= 0;
  if (c <= b) return "";

  for (a || (a = "utf8");;) switch (a) {
    case "hex":
      a = b;
      b = c;
      c = this.length;
      if (!a || 0 > a) a = 0;
      if (!b || 0 > b || b > c) b = c;
      d = "";

      for (c = a; c < b; ++c) a = d, d = this[c], d = 16 > d ? "0" + d.toString(16) : d.toString(16), d = a + d;

      return d;

    case "utf8":
    case "utf-8":
      return Ga(this, b, c);

    case "ascii":
      a = "";

      for (c = Math.min(this.length, c); b < c; ++b) a += String.fromCharCode(this[b] & 127);

      return a;

    case "latin1":
    case "binary":
      a = "";

      for (c = Math.min(this.length, c); b < c; ++b) a += String.fromCharCode(this[b]);

      return a;

    case "base64":
      return b = 0 === b && c === this.length ? oa(this) : oa(this.slice(b, c)), b;

    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      b = this.slice(b, c);
      c = "";

      for (a = 0; a < b.length; a += 2) c += String.fromCharCode(b[a] + 256 * b[a + 1]);

      return c;

    default:
      if (d) throw new TypeError("Unknown encoding: " + a);
      a = (a + "").toLowerCase();
      d = !0;
  }
}

v.prototype._isBuffer = !0;

function A(a, b, c) {
  var d = a[b];
  a[b] = a[c];
  a[c] = d;
}

v.prototype.swap16 = function () {
  var a = this.length;
  if (0 !== a % 2) throw new RangeError("Buffer size must be a multiple of 16-bits");

  for (var b = 0; b < a; b += 2) A(this, b, b + 1);

  return this;
};

v.prototype.swap32 = function () {
  var a = this.length;
  if (0 !== a % 4) throw new RangeError("Buffer size must be a multiple of 32-bits");

  for (var b = 0; b < a; b += 4) A(this, b, b + 3), A(this, b + 1, b + 2);

  return this;
};

v.prototype.swap64 = function () {
  var a = this.length;
  if (0 !== a % 8) throw new RangeError("Buffer size must be a multiple of 64-bits");

  for (var b = 0; b < a; b += 8) A(this, b, b + 7), A(this, b + 1, b + 6), A(this, b + 2, b + 5), A(this, b + 3, b + 4);

  return this;
};

v.prototype.toString = function () {
  var a = this.length | 0;
  return 0 === a ? "" : 0 === arguments.length ? Ga(this, 0, a) : Fa.apply(this, arguments);
};

v.prototype.equals = function (a) {
  if (!z(a)) throw new TypeError("Argument must be a Buffer");
  return this === a ? !0 : 0 === v.compare(this, a);
};

v.prototype.inspect = function () {
  var a = "";
  0 < this.length && (a = this.toString("hex", 0, 50).match(/.{2}/g).join(" "), 50 < this.length && (a += " ... "));
  return "<Buffer " + a + ">";
};

v.prototype.compare = function (a, b, c, d, e) {
  if (!z(a)) throw new TypeError("Argument must be a Buffer");
  void 0 === b && (b = 0);
  void 0 === c && (c = a ? a.length : 0);
  void 0 === d && (d = 0);
  void 0 === e && (e = this.length);
  if (0 > b || c > a.length || 0 > d || e > this.length) throw new RangeError("out of range index");
  if (d >= e && b >= c) return 0;
  if (d >= e) return -1;
  if (b >= c) return 1;
  b >>>= 0;
  c >>>= 0;
  d >>>= 0;
  e >>>= 0;
  if (this === a) return 0;
  var f = e - d,
      g = c - b,
      h = Math.min(f, g);
  d = this.slice(d, e);
  a = a.slice(b, c);

  for (b = 0; b < h; ++b) if (d[b] !== a[b]) {
    f = d[b];
    g = a[b];
    break;
  }

  return f < g ? -1 : g < f ? 1 : 0;
};

function Ha(a, b, c, d, e) {
  if (0 === a.length) return -1;
  "string" === typeof c ? (d = c, c = 0) : 2147483647 < c ? c = 2147483647 : -2147483648 > c && (c = -2147483648);
  c = +c;
  isNaN(c) && (c = e ? 0 : a.length - 1);
  0 > c && (c = a.length + c);

  if (c >= a.length) {
    if (e) return -1;
    c = a.length - 1;
  } else if (0 > c) if (e) c = 0;else return -1;

  "string" === typeof b && (b = v.from(b, d));
  if (z(b)) return 0 === b.length ? -1 : Ia(a, b, c, d, e);
  if ("number" === typeof b) return b &= 255, v.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf ? e ? Uint8Array.prototype.indexOf.call(a, b, c) : Uint8Array.prototype.lastIndexOf.call(a, b, c) : Ia(a, [b], c, d, e);
  throw new TypeError("val must be string, number or Buffer");
}

function Ia(a, b, c, d, e) {
  function f(a, b) {
    return 1 === g ? a[b] : a.readUInt16BE(b * g);
  }

  var g = 1,
      h = a.length,
      l = b.length;

  if (void 0 !== d && (d = String(d).toLowerCase(), "ucs2" === d || "ucs-2" === d || "utf16le" === d || "utf-16le" === d)) {
    if (2 > a.length || 2 > b.length) return -1;
    g = 2;
    h /= 2;
    l /= 2;
    c /= 2;
  }

  if (e) {
    for (d = -1; c < h; c++) if (f(a, c) === f(b, -1 === d ? 0 : c - d)) {
      if (-1 === d && (d = c), c - d + 1 === l) return d * g;
    } else -1 !== d && (c -= c - d), d = -1;
  } else for (c + l > h && (c = h - l); 0 <= c; c--) {
    h = !0;

    for (d = 0; d < l; d++) if (f(a, c + d) !== f(b, d)) {
      h = !1;
      break;
    }

    if (h) return c;
  }
  return -1;
}

v.prototype.includes = function (a, b, c) {
  return -1 !== this.indexOf(a, b, c);
};

v.prototype.indexOf = function (a, b, c) {
  return Ha(this, a, b, c, !0);
};

v.prototype.lastIndexOf = function (a, b, c) {
  return Ha(this, a, b, c, !1);
};

v.prototype.write = function (a, b, c, d) {
  if (void 0 === b) d = "utf8", c = this.length, b = 0;else if (void 0 === c && "string" === typeof b) d = b, c = this.length, b = 0;else if (isFinite(b)) b |= 0, isFinite(c) ? (c |= 0, void 0 === d && (d = "utf8")) : (d = c, c = void 0);else throw Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
  var e = this.length - b;
  if (void 0 === c || c > e) c = e;
  if (0 < a.length && (0 > c || 0 > b) || b > this.length) throw new RangeError("Attempt to write outside buffer bounds");
  d || (d = "utf8");

  for (e = !1;;) switch (d) {
    case "hex":
      a: {
        b = Number(b) || 0;
        d = this.length - b;
        c ? (c = Number(c), c > d && (c = d)) : c = d;
        d = a.length;
        if (0 !== d % 2) throw new TypeError("Invalid hex string");
        c > d / 2 && (c = d / 2);

        for (d = 0; d < c; ++d) {
          e = parseInt(a.substr(2 * d, 2), 16);

          if (isNaN(e)) {
            a = d;
            break a;
          }

          this[b + d] = e;
        }

        a = d;
      }

      return a;

    case "utf8":
    case "utf-8":
      return Ja(Da(a, this.length - b), this, b, c);

    case "ascii":
      return Ja(Ka(a), this, b, c);

    case "latin1":
    case "binary":
      return Ja(Ka(a), this, b, c);

    case "base64":
      return Ja(Ea(a), this, b, c);

    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      d = a;
      e = this.length - b;

      for (var f = [], g = 0; g < d.length && !(0 > (e -= 2)); ++g) {
        var h = d.charCodeAt(g);
        a = h >> 8;
        h %= 256;
        f.push(h);
        f.push(a);
      }

      return Ja(f, this, b, c);

    default:
      if (e) throw new TypeError("Unknown encoding: " + d);
      d = ("" + d).toLowerCase();
      e = !0;
  }
};

v.prototype.toJSON = function () {
  return {
    type: "Buffer",
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function Ga(a, b, c) {
  c = Math.min(a.length, c);

  for (var d = []; b < c;) {
    var e = a[b],
        f = null,
        g = 239 < e ? 4 : 223 < e ? 3 : 191 < e ? 2 : 1;
    if (b + g <= c) switch (g) {
      case 1:
        128 > e && (f = e);
        break;

      case 2:
        var h = a[b + 1];
        128 === (h & 192) && (e = (e & 31) << 6 | h & 63, 127 < e && (f = e));
        break;

      case 3:
        h = a[b + 1];
        var l = a[b + 2];
        128 === (h & 192) && 128 === (l & 192) && (e = (e & 15) << 12 | (h & 63) << 6 | l & 63, 2047 < e && (55296 > e || 57343 < e) && (f = e));
        break;

      case 4:
        h = a[b + 1];
        l = a[b + 2];
        var n = a[b + 3];
        128 === (h & 192) && 128 === (l & 192) && 128 === (n & 192) && (e = (e & 15) << 18 | (h & 63) << 12 | (l & 63) << 6 | n & 63, 65535 < e && 1114112 > e && (f = e));
    }
    null === f ? (f = 65533, g = 1) : 65535 < f && (f -= 65536, d.push(f >>> 10 & 1023 | 55296), f = 56320 | f & 1023);
    d.push(f);
    b += g;
  }

  a = d.length;
  if (a <= La) d = String.fromCharCode.apply(String, d);else {
    c = "";

    for (b = 0; b < a;) c += String.fromCharCode.apply(String, d.slice(b, b += La));

    d = c;
  }
  return d;
}

var La = 4096;

v.prototype.slice = function (a, b) {
  var c = this.length;
  a = ~~a;
  b = void 0 === b ? c : ~~b;
  0 > a ? (a += c, 0 > a && (a = 0)) : a > c && (a = c);
  0 > b ? (b += c, 0 > b && (b = 0)) : b > c && (b = c);
  b < a && (b = a);
  if (v.TYPED_ARRAY_SUPPORT) b = this.subarray(a, b), b.__proto__ = v.prototype;else {
    c = b - a;
    b = new v(c, void 0);

    for (var d = 0; d < c; ++d) b[d] = this[d + a];
  }
  return b;
};

function C(a, b, c) {
  if (0 !== a % 1 || 0 > a) throw new RangeError("offset is not uint");
  if (a + b > c) throw new RangeError("Trying to access beyond buffer length");
}

v.prototype.readUIntLE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = this[a];

  for (var d = 1, e = 0; ++e < b && (d *= 256);) c += this[a + e] * d;

  return c;
};

v.prototype.readUIntBE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = this[a + --b];

  for (var d = 1; 0 < b && (d *= 256);) c += this[a + --b] * d;

  return c;
};

v.prototype.readUInt8 = function (a, b) {
  b || C(a, 1, this.length);
  return this[a];
};

v.prototype.readUInt16LE = function (a, b) {
  b || C(a, 2, this.length);
  return this[a] | this[a + 1] << 8;
};

v.prototype.readUInt16BE = function (a, b) {
  b || C(a, 2, this.length);
  return this[a] << 8 | this[a + 1];
};

v.prototype.readUInt32LE = function (a, b) {
  b || C(a, 4, this.length);
  return (this[a] | this[a + 1] << 8 | this[a + 2] << 16) + 16777216 * this[a + 3];
};

v.prototype.readUInt32BE = function (a, b) {
  b || C(a, 4, this.length);
  return 16777216 * this[a] + (this[a + 1] << 16 | this[a + 2] << 8 | this[a + 3]);
};

v.prototype.readIntLE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = this[a];

  for (var d = 1, e = 0; ++e < b && (d *= 256);) c += this[a + e] * d;

  c >= 128 * d && (c -= Math.pow(2, 8 * b));
  return c;
};

v.prototype.readIntBE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = b;

  for (var d = 1, e = this[a + --c]; 0 < c && (d *= 256);) e += this[a + --c] * d;

  e >= 128 * d && (e -= Math.pow(2, 8 * b));
  return e;
};

v.prototype.readInt8 = function (a, b) {
  b || C(a, 1, this.length);
  return this[a] & 128 ? -1 * (255 - this[a] + 1) : this[a];
};

v.prototype.readInt16LE = function (a, b) {
  b || C(a, 2, this.length);
  a = this[a] | this[a + 1] << 8;
  return a & 32768 ? a | 4294901760 : a;
};

v.prototype.readInt16BE = function (a, b) {
  b || C(a, 2, this.length);
  a = this[a + 1] | this[a] << 8;
  return a & 32768 ? a | 4294901760 : a;
};

v.prototype.readInt32LE = function (a, b) {
  b || C(a, 4, this.length);
  return this[a] | this[a + 1] << 8 | this[a + 2] << 16 | this[a + 3] << 24;
};

v.prototype.readInt32BE = function (a, b) {
  b || C(a, 4, this.length);
  return this[a] << 24 | this[a + 1] << 16 | this[a + 2] << 8 | this[a + 3];
};

v.prototype.readFloatLE = function (a, b) {
  b || C(a, 4, this.length);
  return pa(this, a, !0, 23, 4);
};

v.prototype.readFloatBE = function (a, b) {
  b || C(a, 4, this.length);
  return pa(this, a, !1, 23, 4);
};

v.prototype.readDoubleLE = function (a, b) {
  b || C(a, 8, this.length);
  return pa(this, a, !0, 52, 8);
};

v.prototype.readDoubleBE = function (a, b) {
  b || C(a, 8, this.length);
  return pa(this, a, !1, 52, 8);
};

function D(a, b, c, d, e, f) {
  if (!z(a)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (b > e || b < f) throw new RangeError('"value" argument is out of bounds');
  if (c + d > a.length) throw new RangeError("Index out of range");
}

v.prototype.writeUIntLE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  c |= 0;
  d || D(this, a, b, c, Math.pow(2, 8 * c) - 1, 0);
  d = 1;
  var e = 0;

  for (this[b] = a & 255; ++e < c && (d *= 256);) this[b + e] = a / d & 255;

  return b + c;
};

v.prototype.writeUIntBE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  c |= 0;
  d || D(this, a, b, c, Math.pow(2, 8 * c) - 1, 0);
  d = c - 1;
  var e = 1;

  for (this[b + d] = a & 255; 0 <= --d && (e *= 256);) this[b + d] = a / e & 255;

  return b + c;
};

v.prototype.writeUInt8 = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 1, 255, 0);
  v.TYPED_ARRAY_SUPPORT || (a = Math.floor(a));
  this[b] = a & 255;
  return b + 1;
};

function Ma(a, b, c, d) {
  0 > b && (b = 65535 + b + 1);

  for (var e = 0, f = Math.min(a.length - c, 2); e < f; ++e) a[c + e] = (b & 255 << 8 * (d ? e : 1 - e)) >>> 8 * (d ? e : 1 - e);
}

v.prototype.writeUInt16LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 2, 65535, 0);
  v.TYPED_ARRAY_SUPPORT ? (this[b] = a & 255, this[b + 1] = a >>> 8) : Ma(this, a, b, !0);
  return b + 2;
};

v.prototype.writeUInt16BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 2, 65535, 0);
  v.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 8, this[b + 1] = a & 255) : Ma(this, a, b, !1);
  return b + 2;
};

function Na(a, b, c, d) {
  0 > b && (b = 4294967295 + b + 1);

  for (var e = 0, f = Math.min(a.length - c, 4); e < f; ++e) a[c + e] = b >>> 8 * (d ? e : 3 - e) & 255;
}

v.prototype.writeUInt32LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 4, 4294967295, 0);
  v.TYPED_ARRAY_SUPPORT ? (this[b + 3] = a >>> 24, this[b + 2] = a >>> 16, this[b + 1] = a >>> 8, this[b] = a & 255) : Na(this, a, b, !0);
  return b + 4;
};

v.prototype.writeUInt32BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 4, 4294967295, 0);
  v.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 24, this[b + 1] = a >>> 16, this[b + 2] = a >>> 8, this[b + 3] = a & 255) : Na(this, a, b, !1);
  return b + 4;
};

v.prototype.writeIntLE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  d || (d = Math.pow(2, 8 * c - 1), D(this, a, b, c, d - 1, -d));
  d = 0;
  var e = 1,
      f = 0;

  for (this[b] = a & 255; ++d < c && (e *= 256);) 0 > a && 0 === f && 0 !== this[b + d - 1] && (f = 1), this[b + d] = (a / e >> 0) - f & 255;

  return b + c;
};

v.prototype.writeIntBE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  d || (d = Math.pow(2, 8 * c - 1), D(this, a, b, c, d - 1, -d));
  d = c - 1;
  var e = 1,
      f = 0;

  for (this[b + d] = a & 255; 0 <= --d && (e *= 256);) 0 > a && 0 === f && 0 !== this[b + d + 1] && (f = 1), this[b + d] = (a / e >> 0) - f & 255;

  return b + c;
};

v.prototype.writeInt8 = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 1, 127, -128);
  v.TYPED_ARRAY_SUPPORT || (a = Math.floor(a));
  0 > a && (a = 255 + a + 1);
  this[b] = a & 255;
  return b + 1;
};

v.prototype.writeInt16LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 2, 32767, -32768);
  v.TYPED_ARRAY_SUPPORT ? (this[b] = a & 255, this[b + 1] = a >>> 8) : Ma(this, a, b, !0);
  return b + 2;
};

v.prototype.writeInt16BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 2, 32767, -32768);
  v.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 8, this[b + 1] = a & 255) : Ma(this, a, b, !1);
  return b + 2;
};

v.prototype.writeInt32LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 4, 2147483647, -2147483648);
  v.TYPED_ARRAY_SUPPORT ? (this[b] = a & 255, this[b + 1] = a >>> 8, this[b + 2] = a >>> 16, this[b + 3] = a >>> 24) : Na(this, a, b, !0);
  return b + 4;
};

v.prototype.writeInt32BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || D(this, a, b, 4, 2147483647, -2147483648);
  0 > a && (a = 4294967295 + a + 1);
  v.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 24, this[b + 1] = a >>> 16, this[b + 2] = a >>> 8, this[b + 3] = a & 255) : Na(this, a, b, !1);
  return b + 4;
};

function Oa(a, b, c, d) {
  if (c + d > a.length) throw new RangeError("Index out of range");
  if (0 > c) throw new RangeError("Index out of range");
}

v.prototype.writeFloatLE = function (a, b, c) {
  c || Oa(this, a, b, 4);
  qa(this, a, b, !0, 23, 4);
  return b + 4;
};

v.prototype.writeFloatBE = function (a, b, c) {
  c || Oa(this, a, b, 4);
  qa(this, a, b, !1, 23, 4);
  return b + 4;
};

v.prototype.writeDoubleLE = function (a, b, c) {
  c || Oa(this, a, b, 8);
  qa(this, a, b, !0, 52, 8);
  return b + 8;
};

v.prototype.writeDoubleBE = function (a, b, c) {
  c || Oa(this, a, b, 8);
  qa(this, a, b, !1, 52, 8);
  return b + 8;
};

v.prototype.copy = function (a, b, c, d) {
  c || (c = 0);
  d || 0 === d || (d = this.length);
  b >= a.length && (b = a.length);
  b || (b = 0);
  0 < d && d < c && (d = c);
  if (d === c || 0 === a.length || 0 === this.length) return 0;
  if (0 > b) throw new RangeError("targetStart out of bounds");
  if (0 > c || c >= this.length) throw new RangeError("sourceStart out of bounds");
  if (0 > d) throw new RangeError("sourceEnd out of bounds");
  d > this.length && (d = this.length);
  a.length - b < d - c && (d = a.length - b + c);
  var e = d - c;
  if (this === a && c < b && b < d) for (d = e - 1; 0 <= d; --d) a[d + b] = this[d + c];else if (1E3 > e || !v.TYPED_ARRAY_SUPPORT) for (d = 0; d < e; ++d) a[d + b] = this[d + c];else Uint8Array.prototype.set.call(a, this.subarray(c, c + e), b);
  return e;
};

v.prototype.fill = function (a, b, c, d) {
  if ("string" === typeof a) {
    "string" === typeof b ? (d = b, b = 0, c = this.length) : "string" === typeof c && (d = c, c = this.length);

    if (1 === a.length) {
      var e = a.charCodeAt(0);
      256 > e && (a = e);
    }

    if (void 0 !== d && "string" !== typeof d) throw new TypeError("encoding must be a string");
    if ("string" === typeof d && !v.isEncoding(d)) throw new TypeError("Unknown encoding: " + d);
  } else "number" === typeof a && (a &= 255);

  if (0 > b || this.length < b || this.length < c) throw new RangeError("Out of range index");
  if (c <= b) return this;
  b >>>= 0;
  c = void 0 === c ? this.length : c >>> 0;
  a || (a = 0);
  if ("number" === typeof a) for (d = b; d < c; ++d) this[d] = a;else for (a = z(a) ? a : Da(new v(a, d).toString()), e = a.length, d = 0; d < c - b; ++d) this[d + b] = a[d % e];
  return this;
};

var Pa = /[^+\/0-9A-Za-z-_]/g;

function Da(a, b) {
  b = b || Infinity;

  for (var c, d = a.length, e = null, f = [], g = 0; g < d; ++g) {
    c = a.charCodeAt(g);

    if (55295 < c && 57344 > c) {
      if (!e) {
        if (56319 < c) {
          -1 < (b -= 3) && f.push(239, 191, 189);
          continue;
        } else if (g + 1 === d) {
          -1 < (b -= 3) && f.push(239, 191, 189);
          continue;
        }

        e = c;
        continue;
      }

      if (56320 > c) {
        -1 < (b -= 3) && f.push(239, 191, 189);
        e = c;
        continue;
      }

      c = (e - 55296 << 10 | c - 56320) + 65536;
    } else e && -1 < (b -= 3) && f.push(239, 191, 189);

    e = null;

    if (128 > c) {
      if (0 > --b) break;
      f.push(c);
    } else if (2048 > c) {
      if (0 > (b -= 2)) break;
      f.push(c >> 6 | 192, c & 63 | 128);
    } else if (65536 > c) {
      if (0 > (b -= 3)) break;
      f.push(c >> 12 | 224, c >> 6 & 63 | 128, c & 63 | 128);
    } else if (1114112 > c) {
      if (0 > (b -= 4)) break;
      f.push(c >> 18 | 240, c >> 12 & 63 | 128, c >> 6 & 63 | 128, c & 63 | 128);
    } else throw Error("Invalid code point");
  }

  return f;
}

function Ka(a) {
  for (var b = [], c = 0; c < a.length; ++c) b.push(a.charCodeAt(c) & 255);

  return b;
}

function Ea(a) {
  a = (a.trim ? a.trim() : a.replace(/^\s+|\s+$/g, "")).replace(Pa, "");
  if (2 > a.length) a = "";else for (; 0 !== a.length % 4;) a += "=";
  la || ma();
  var b = a.length;
  if (0 < b % 4) throw Error("Invalid string. Length must be a multiple of 4");
  var c = "=" === a[b - 2] ? 2 : "=" === a[b - 1] ? 1 : 0;
  var d = new ka(3 * b / 4 - c);
  var e = 0 < c ? b - 4 : b;
  var f = 0;

  for (b = 0; b < e; b += 4) {
    var g = u[a.charCodeAt(b)] << 18 | u[a.charCodeAt(b + 1)] << 12 | u[a.charCodeAt(b + 2)] << 6 | u[a.charCodeAt(b + 3)];
    d[f++] = g >> 16 & 255;
    d[f++] = g >> 8 & 255;
    d[f++] = g & 255;
  }

  2 === c ? (g = u[a.charCodeAt(b)] << 2 | u[a.charCodeAt(b + 1)] >> 4, d[f++] = g & 255) : 1 === c && (g = u[a.charCodeAt(b)] << 10 | u[a.charCodeAt(b + 1)] << 4 | u[a.charCodeAt(b + 2)] >> 2, d[f++] = g >> 8 & 255, d[f++] = g & 255);
  return d;
}

function Ja(a, b, c, d) {
  for (var e = 0; e < d && !(e + c >= b.length || e >= a.length); ++e) b[e + c] = a[e];

  return e;
}

function Ca(a) {
  return null != a && (!!a._isBuffer || Qa(a) || "function" === typeof a.readFloatLE && "function" === typeof a.slice && Qa(a.slice(0, 0)));
}

function Qa(a) {
  return !!a.constructor && "function" === typeof a.constructor.isBuffer && a.constructor.isBuffer(a);
}

var Ra = Object.freeze({
  __proto__: null,
  INSPECT_MAX_BYTES: 50,
  kMaxLength: ta,
  Buffer: v,
  SlowBuffer: function (a) {
    +a != a && (a = 0);
    return v.alloc(+a);
  },
  isBuffer: Ca
}),
    E = v,
    Sa = "undefined" !== typeof globalThis ? globalThis : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : {};

function Ta(a, b) {
  return b = {
    exports: {}
  }, a(b, b.exports), b.exports;
}

function Ua() {
  throw Error("setTimeout has not been defined");
}

function Va() {
  throw Error("clearTimeout has not been defined");
}

var F = Ua,
    G = Va;
"function" === typeof ja.setTimeout && (F = setTimeout);
"function" === typeof ja.clearTimeout && (G = clearTimeout);

function Wa(a) {
  if (F === setTimeout) return setTimeout(a, 0);
  if ((F === Ua || !F) && setTimeout) return F = setTimeout, setTimeout(a, 0);

  try {
    return F(a, 0);
  } catch (b) {
    try {
      return F.call(null, a, 0);
    } catch (c) {
      return F.call(this, a, 0);
    }
  }
}

function Xa(a) {
  if (G === clearTimeout) return clearTimeout(a);
  if ((G === Va || !G) && clearTimeout) return G = clearTimeout, clearTimeout(a);

  try {
    return G(a);
  } catch (b) {
    try {
      return G.call(null, a);
    } catch (c) {
      return G.call(this, a);
    }
  }
}

var H = [],
    I = !1,
    J,
    Ya = -1;

function Za() {
  I && J && (I = !1, J.length ? H = J.concat(H) : Ya = -1, H.length && $a());
}

function $a() {
  if (!I) {
    var a = Wa(Za);
    I = !0;

    for (var b = H.length; b;) {
      J = H;

      for (H = []; ++Ya < b;) J && J[Ya].run();

      Ya = -1;
      b = H.length;
    }

    J = null;
    I = !1;
    Xa(a);
  }
}

function ab(a) {
  var b = Array(arguments.length - 1);
  if (1 < arguments.length) for (var c = 1; c < arguments.length; c++) b[c - 1] = arguments[c];
  H.push(new bb(a, b));
  1 !== H.length || I || Wa($a);
}

function bb(a, b) {
  this.fun = a;
  this.array = b;
}

bb.prototype.run = function () {
  this.fun.apply(null, this.array);
};

function K() {}

var L = ja.performance || {},
    cb = L.now || L.mozNow || L.msNow || L.oNow || L.webkitNow || function () {
  return new Date().getTime();
},
    db = new Date(),
    eb = {
  nextTick: ab,
  title: "browser",
  browser: !0,
  env: {},
  argv: [],
  version: "",
  versions: {},
  on: K,
  addListener: K,
  once: K,
  off: K,
  removeListener: K,
  removeAllListeners: K,
  emit: K,
  binding: function () {
    throw Error("process.binding is not supported");
  },
  cwd: function () {
    return "/";
  },
  chdir: function () {
    throw Error("process.chdir is not supported");
  },
  umask: function () {
    return 0;
  },
  hrtime: function (a) {
    var b = .001 * cb.call(L),
        c = Math.floor(b);
    b = Math.floor(b % 1 * 1E9);
    a && (c -= a[0], b -= a[1], 0 > b && (c--, b += 1E9));
    return [c, b];
  },
  platform: "browser",
  release: {},
  config: {},
  uptime: function () {
    return (new Date() - db) / 1E3;
  }
},
    fb = Ta(function (a, b) {
  function c(a, b) {
    for (var c in a) b[c] = a[c];
  }

  function d(a, b, c) {
    return e(a, b, c);
  }

  var e = Ra.Buffer;
  e.from && e.alloc && e.allocUnsafe && e.allocUnsafeSlow ? a.exports = Ra : (c(Ra, b), b.Buffer = d);
  d.prototype = Object.create(e.prototype);
  c(e, d);

  d.from = function (a, b, c) {
    if ("number" === typeof a) throw new TypeError("Argument must not be a number");
    return e(a, b, c);
  };

  d.alloc = function (a, b, c) {
    if ("number" !== typeof a) throw new TypeError("Argument must be a number");
    a = e(a);
    void 0 !== b ? "string" === typeof c ? a.fill(b, c) : a.fill(b) : a.fill(0);
    return a;
  };

  d.allocUnsafe = function (a) {
    if ("number" !== typeof a) throw new TypeError("Argument must be a number");
    return e(a);
  };

  d.allocUnsafeSlow = function (a) {
    if ("number" !== typeof a) throw new TypeError("Argument must be a number");
    return Ra.SlowBuffer(a);
  };
}),
    gb = Ta(function (a, b) {
  function c() {
    throw Error("secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11");
  }

  function d(a, b) {
    if ("number" !== typeof a || a !== a) throw new TypeError("offset must be a number");
    if (a > p || 0 > a) throw new TypeError("offset must be a uint32");
    if (a > n || a > b) throw new RangeError("offset out of range");
  }

  function e(a, b, c) {
    if ("number" !== typeof a || a !== a) throw new TypeError("size must be a number");
    if (a > p || 0 > a) throw new TypeError("size must be a uint32");
    if (a + b > c || a > n) throw new RangeError("buffer too small");
  }

  function f(a, b, c, f) {
    if (!(l.isBuffer(a) || a instanceof Sa.Uint8Array)) throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
    if ("function" === typeof b) f = b, b = 0, c = a.length;else if ("function" === typeof c) f = c, c = a.length - b;else if ("function" !== typeof f) throw new TypeError('"cb" argument must be a function');
    d(b, a.length);
    e(c, b, a.length);
    return g(a, b, c, f);
  }

  function g(a, b, c, d) {
    b = new Uint8Array(a.buffer, b, c);
    r.getRandomValues(b);
    if (d) ab(function () {
      d(null, a);
    });else return a;
  }

  function h(a, b, c) {
    "undefined" === typeof b && (b = 0);
    if (!(l.isBuffer(a) || a instanceof Sa.Uint8Array)) throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
    d(b, a.length);
    void 0 === c && (c = a.length - b);
    e(c, b, a.length);
    return g(a, b, c);
  }

  var l = fb.Buffer,
      n = fb.kMaxLength,
      r = Sa.crypto || Sa.msCrypto,
      p = Math.pow(2, 32) - 1;
  r && r.getRandomValues ? (b.randomFill = f, b.randomFillSync = h) : (b.randomFill = c, b.randomFillSync = c);
}),
    hb = Ta(function (a) {
  a.exports = gb;
}).randomFillSync,
    ib = Math.floor(.001 * (Date.now() - performance.now()));

function M(a) {
  if ("string" !== typeof a) throw new TypeError("Path must be a string. Received " + JSON.stringify(a));
}

function jb(a, b) {
  for (var c = "", d = 0, e = -1, f = 0, g, h = 0; h <= a.length; ++h) {
    if (h < a.length) g = a.charCodeAt(h);else if (47 === g) break;else g = 47;

    if (47 === g) {
      if (e !== h - 1 && 1 !== f) if (e !== h - 1 && 2 === f) {
        if (2 > c.length || 2 !== d || 46 !== c.charCodeAt(c.length - 1) || 46 !== c.charCodeAt(c.length - 2)) if (2 < c.length) {
          if (e = c.lastIndexOf("/"), e !== c.length - 1) {
            -1 === e ? (c = "", d = 0) : (c = c.slice(0, e), d = c.length - 1 - c.lastIndexOf("/"));
            e = h;
            f = 0;
            continue;
          }
        } else if (2 === c.length || 1 === c.length) {
          c = "";
          d = 0;
          e = h;
          f = 0;
          continue;
        }
        b && (c = 0 < c.length ? c + "/.." : "..", d = 2);
      } else c = 0 < c.length ? c + ("/" + a.slice(e + 1, h)) : a.slice(e + 1, h), d = h - e - 1;
      e = h;
      f = 0;
    } else 46 === g && -1 !== f ? ++f : f = -1;
  }

  return c;
}

var kb = {
  resolve: function () {
    for (var a = "", b = !1, c, d = arguments.length - 1; -1 <= d && !b; d--) {
      if (0 <= d) var e = arguments[d];else void 0 === c && (c = eb.cwd()), e = c;
      M(e);
      0 !== e.length && (a = e + "/" + a, b = 47 === e.charCodeAt(0));
    }

    a = jb(a, !b);
    return b ? 0 < a.length ? "/" + a : "/" : 0 < a.length ? a : ".";
  },
  normalize: function (a) {
    M(a);
    if (0 === a.length) return ".";
    var b = 47 === a.charCodeAt(0),
        c = 47 === a.charCodeAt(a.length - 1);
    a = jb(a, !b);
    0 !== a.length || b || (a = ".");
    0 < a.length && c && (a += "/");
    return b ? "/" + a : a;
  },
  isAbsolute: function (a) {
    M(a);
    return 0 < a.length && 47 === a.charCodeAt(0);
  },
  join: function () {
    if (0 === arguments.length) return ".";

    for (var a, b = 0; b < arguments.length; ++b) {
      var c = arguments[b];
      M(c);
      0 < c.length && (a = void 0 === a ? c : a + ("/" + c));
    }

    return void 0 === a ? "." : kb.normalize(a);
  },
  relative: function (a, b) {
    M(a);
    M(b);
    if (a === b) return "";
    a = kb.resolve(a);
    b = kb.resolve(b);
    if (a === b) return "";

    for (var c = 1; c < a.length && 47 === a.charCodeAt(c); ++c);

    for (var d = a.length, e = d - c, f = 1; f < b.length && 47 === b.charCodeAt(f); ++f);

    for (var g = b.length - f, h = e < g ? e : g, l = -1, n = 0; n <= h; ++n) {
      if (n === h) {
        if (g > h) {
          if (47 === b.charCodeAt(f + n)) return b.slice(f + n + 1);
          if (0 === n) return b.slice(f + n);
        } else e > h && (47 === a.charCodeAt(c + n) ? l = n : 0 === n && (l = 0));

        break;
      }

      var r = a.charCodeAt(c + n),
          p = b.charCodeAt(f + n);
      if (r !== p) break;else 47 === r && (l = n);
    }

    e = "";

    for (n = c + l + 1; n <= d; ++n) if (n === d || 47 === a.charCodeAt(n)) e = 0 === e.length ? e + ".." : e + "/..";

    if (0 < e.length) return e + b.slice(f + l);
    f += l;
    47 === b.charCodeAt(f) && ++f;
    return b.slice(f);
  },
  _makeLong: function (a) {
    return a;
  },
  dirname: function (a) {
    M(a);
    if (0 === a.length) return ".";

    for (var b = a.charCodeAt(0), c = 47 === b, d = -1, e = !0, f = a.length - 1; 1 <= f; --f) if (b = a.charCodeAt(f), 47 === b) {
      if (!e) {
        d = f;
        break;
      }
    } else e = !1;

    return -1 === d ? c ? "/" : "." : c && 1 === d ? "//" : a.slice(0, d);
  },
  basename: function (a, b) {
    if (void 0 !== b && "string" !== typeof b) throw new TypeError('"ext" argument must be a string');
    M(a);
    var c = 0,
        d = -1,
        e = !0,
        f;

    if (void 0 !== b && 0 < b.length && b.length <= a.length) {
      if (b.length === a.length && b === a) return "";
      var g = b.length - 1,
          h = -1;

      for (f = a.length - 1; 0 <= f; --f) {
        var l = a.charCodeAt(f);

        if (47 === l) {
          if (!e) {
            c = f + 1;
            break;
          }
        } else -1 === h && (e = !1, h = f + 1), 0 <= g && (l === b.charCodeAt(g) ? -1 === --g && (d = f) : (g = -1, d = h));
      }

      c === d ? d = h : -1 === d && (d = a.length);
      return a.slice(c, d);
    }

    for (f = a.length - 1; 0 <= f; --f) if (47 === a.charCodeAt(f)) {
      if (!e) {
        c = f + 1;
        break;
      }
    } else -1 === d && (e = !1, d = f + 1);

    return -1 === d ? "" : a.slice(c, d);
  },
  extname: function (a) {
    M(a);

    for (var b = -1, c = 0, d = -1, e = !0, f = 0, g = a.length - 1; 0 <= g; --g) {
      var h = a.charCodeAt(g);

      if (47 === h) {
        if (!e) {
          c = g + 1;
          break;
        }
      } else -1 === d && (e = !1, d = g + 1), 46 === h ? -1 === b ? b = g : 1 !== f && (f = 1) : -1 !== b && (f = -1);
    }

    return -1 === b || -1 === d || 0 === f || 1 === f && b === d - 1 && b === c + 1 ? "" : a.slice(b, d);
  },
  format: function (a) {
    if (null === a || "object" !== typeof a) throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof a);
    var b = a.dir || a.root,
        c = a.base || (a.name || "") + (a.ext || "");
    a = b ? b === a.root ? b + c : b + "/" + c : c;
    return a;
  },
  parse: function (a) {
    M(a);
    var b = {
      root: "",
      dir: "",
      base: "",
      ext: "",
      name: ""
    };
    if (0 === a.length) return b;
    var c = a.charCodeAt(0),
        d = 47 === c;

    if (d) {
      b.root = "/";
      var e = 1;
    } else e = 0;

    for (var f = -1, g = 0, h = -1, l = !0, n = a.length - 1, r = 0; n >= e; --n) if (c = a.charCodeAt(n), 47 === c) {
      if (!l) {
        g = n + 1;
        break;
      }
    } else -1 === h && (l = !1, h = n + 1), 46 === c ? -1 === f ? f = n : 1 !== r && (r = 1) : -1 !== f && (r = -1);

    -1 === f || -1 === h || 0 === r || 1 === r && f === h - 1 && f === g + 1 ? -1 !== h && (b.base = 0 === g && d ? b.name = a.slice(1, h) : b.name = a.slice(g, h)) : (0 === g && d ? (b.name = a.slice(1, f), b.base = a.slice(1, h)) : (b.name = a.slice(g, f), b.base = a.slice(g, h)), b.ext = a.slice(f, h));
    0 < g ? b.dir = a.slice(0, g - 1) : d && (b.dir = "/");
    return b;
  },
  sep: "/",
  delimiter: ":",
  win32: null,
  posix: null
},
    lb = kb.posix = kb,
    mb = Object.freeze({
  __proto__: null,
  "default": lb,
  __moduleExports: lb
}),
    pb = {
  hrtime: function (a) {
    return function (b) {
      b = a(b);
      return 1E9 * b[0] + b[1];
    };
  }(function (a) {
    var b = .001 * performance.now(),
        c = Math.floor(b) + ib;
    b = Math.floor(b % 1 * 1E9);
    a && (c -= a[0], b -= a[1], 0 > b && (c--, b += 1E9));
    return [c, b];
  }),
  exit: function (a) {
    throw new nb(a);
  },
  kill: function (a) {
    throw new ob(a);
  },
  randomFillSync: hb,
  isTTY: function () {
    return !0;
  },
  path: mb,
  fs: null
},
    N,
    O = k(1),
    P = k(2),
    Q = k(4),
    R = k(8),
    S = k(16),
    qb = k(32),
    T = k(64),
    V = k(128),
    sb = k(256),
    tb = k(512),
    ub = k(1024),
    vb = k(2048),
    wb = k(4096),
    xb = k(8192),
    yb = k(16384),
    zb = k(32768),
    Ab = k(65536),
    Bb = k(131072),
    Cb = k(262144),
    Db = k(524288),
    Eb = k(1048576),
    W = k(2097152),
    Ib = k(4194304),
    Jb = k(8388608),
    Kb = k(16777216),
    Lb = k(33554432),
    Mb = k(67108864),
    X = k(134217728),
    Nb = k(268435456),
    Ob = O | P | Q | R | S | qb | T | V | sb | tb | ub | vb | wb | xb | yb | zb | Ab | Bb | Cb | Db | Eb | W | Jb | Ib | Kb | Mb | Lb | X | Nb,
    Pb = O | P | Q | R | S | qb | T | V | sb | W | Ib | Jb | X,
    Qb = k(0),
    Rb = R | S | V | tb | ub | vb | wb | xb | yb | zb | Ab | Bb | Cb | Db | Eb | W | Jb | Kb | Mb | Lb | X,
    Sb = Rb | Pb,
    Tb = P | R | T | W | X | Nb,
    Ub = P | R | T | W | X,
    Vb = k(0),
    Wb = {
  E2BIG: 1,
  EACCES: 2,
  EADDRINUSE: 3,
  EADDRNOTAVAIL: 4,
  EAFNOSUPPORT: 5,
  EALREADY: 7,
  EAGAIN: 6,
  EBADF: 8,
  EBADMSG: 9,
  EBUSY: 10,
  ECANCELED: 11,
  ECHILD: 12,
  ECONNABORTED: 13,
  ECONNREFUSED: 14,
  ECONNRESET: 15,
  EDEADLOCK: 16,
  EDESTADDRREQ: 17,
  EDOM: 18,
  EDQUOT: 19,
  EEXIST: 20,
  EFAULT: 21,
  EFBIG: 22,
  EHOSTDOWN: 23,
  EHOSTUNREACH: 23,
  EIDRM: 24,
  EILSEQ: 25,
  EINPROGRESS: 26,
  EINTR: 27,
  EINVAL: 28,
  EIO: 29,
  EISCONN: 30,
  EISDIR: 31,
  ELOOP: 32,
  EMFILE: 33,
  EMLINK: 34,
  EMSGSIZE: 35,
  EMULTIHOP: 36,
  ENAMETOOLONG: 37,
  ENETDOWN: 38,
  ENETRESET: 39,
  ENETUNREACH: 40,
  ENFILE: 41,
  ENOBUFS: 42,
  ENODEV: 43,
  ENOENT: 44,
  ENOEXEC: 45,
  ENOLCK: 46,
  ENOLINK: 47,
  ENOMEM: 48,
  ENOMSG: 49,
  ENOPROTOOPT: 50,
  ENOSPC: 51,
  ENOSYS: 52,
  ENOTCONN: 53,
  ENOTDIR: 54,
  ENOTEMPTY: 55,
  ENOTRECOVERABLE: 56,
  ENOTSOCK: 57,
  ENOTTY: 59,
  ENXIO: 60,
  EOVERFLOW: 61,
  EOWNERDEAD: 62,
  EPERM: 63,
  EPIPE: 64,
  EPROTO: 65,
  EPROTONOSUPPORT: 66,
  EPROTOTYPE: 67,
  ERANGE: 68,
  EROFS: 69,
  ESPIPE: 70,
  ESRCH: 71,
  ESTALE: 72,
  ETIMEDOUT: 73,
  ETXTBSY: 74,
  EXDEV: 75
},
    Xb = (N = {}, N[6] = "SIGHUP", N[8] = "SIGINT", N[11] = "SIGQUIT", N[7] = "SIGILL", N[15] = "SIGTRAP", N[0] = "SIGABRT", N[2] = "SIGBUS", N[5] = "SIGFPE", N[9] = "SIGKILL", N[20] = "SIGUSR1", N[12] = "SIGSEGV", N[21] = "SIGUSR2", N[10] = "SIGPIPE", N[1] = "SIGALRM", N[14] = "SIGTERM", N[3] = "SIGCHLD", N[4] = "SIGCONT", N[13] = "SIGSTOP", N[16] = "SIGTSTP", N[17] = "SIGTTIN", N[18] = "SIGTTOU", N[19] = "SIGURG", N[23] = "SIGXCPU", N[24] = "SIGXFSZ", N[22] = "SIGVTALRM", N),
    Yb = O | P | S | V | W | X,
    Zb = O | T | S | V | W | X;

function Y(a) {
  var b = Math.trunc(a);
  a = k(Math.round(1E6 * (a - b)));
  return k(b) * k(1E6) + a;
}

function $b(a) {
  "number" === typeof a && (a = Math.trunc(a));
  a = k(a);
  return Number(a / k(1E6));
}

function Z(a) {
  return function () {
    for (var b = [], c = 0; c < arguments.length; c++) b[c] = arguments[c];

    try {
      return a.apply(void 0, fa(b));
    } catch (d) {
      if (d && d.code && "string" === typeof d.code) return Wb[d.code] || 28;
      if (d instanceof ac) return d.errno;
      throw d;
    }
  };
}

function bc(a, b) {
  var c = a.FD_MAP.get(b);
  if (!c) throw new ac(8);

  if (void 0 === c.filetype) {
    var d = a.bindings.fs.fstatSync(c.real);
    a = cc(a, b, d);
    b = a.rightsBase;
    d = a.rightsInheriting;
    c.filetype = a.filetype;
    c.rights || (c.rights = {
      base: b,
      inheriting: d
    });
  }

  return c;
}

function cc(a, b, c) {
  switch (!0) {
    case c.isBlockDevice():
      return {
        filetype: 1,
        rightsBase: Ob,
        rightsInheriting: Ob
      };

    case c.isCharacterDevice():
      return void 0 !== b && a.bindings.isTTY(b) ? {
        filetype: 2,
        rightsBase: Ub,
        rightsInheriting: Vb
      } : {
        filetype: 2,
        rightsBase: Ob,
        rightsInheriting: Ob
      };

    case c.isDirectory():
      return {
        filetype: 3,
        rightsBase: Rb,
        rightsInheriting: Sb
      };

    case c.isFIFO():
      return {
        filetype: 6,
        rightsBase: Tb,
        rightsInheriting: Ob
      };

    case c.isFile():
      return {
        filetype: 4,
        rightsBase: Pb,
        rightsInheriting: Qb
      };

    case c.isSocket():
      return {
        filetype: 6,
        rightsBase: Tb,
        rightsInheriting: Ob
      };

    case c.isSymbolicLink():
      return {
        filetype: 7,
        rightsBase: k(0),
        rightsInheriting: k(0)
      };

    default:
      return {
        filetype: 0,
        rightsBase: k(0),
        rightsInheriting: k(0)
      };
  }
}

var ac = function (a) {
  function b(c) {
    var d = a.call(this) || this;
    d.errno = c;
    Object.setPrototypeOf(d, b.prototype);
    return d;
  }

  ba(b, a);
  return b;
}(Error),
    nb = function (a) {
  function b(c) {
    var d = a.call(this, "WASI Exit error: " + c) || this;
    d.code = c;
    Object.setPrototypeOf(d, b.prototype);
    return d;
  }

  ba(b, a);
  return b;
}(Error),
    ob = function (a) {
  function b(c) {
    var d = a.call(this, "WASI Kill signal: " + c) || this;
    d.signal = c;
    Object.setPrototypeOf(d, b.prototype);
    return d;
  }

  ba(b, a);
  return b;
}(Error),
    dc = function () {
  function a(a) {
    function b(a) {
      switch (a) {
        case 1:
          return r.hrtime();

        case 0:
          return Y(Date.now());

        case 2:
        case 3:
          return r.hrtime() - ec;

        default:
          return null;
      }
    }

    function d(a, b) {
      a = bc(g, a);
      if (b !== k(0) && (a.rights.base & b) === k(0)) throw new ac(63);
      return a;
    }

    function e(a, b) {
      g.refreshMemory();
      return Array.from({
        length: b
      }, function (b, c) {
        c = a + 8 * c;
        b = g.view.getUint32(c, !0);
        c = g.view.getUint32(c + 4, !0);
        return new Uint8Array(g.memory.buffer, b, c);
      });
    }

    var f,
        g = this,
        h = {};
    a && a.preopens ? h = a.preopens : a && a.preopenDirectories && (h = a.preopenDirectories);
    var l = {};
    a && a.env && (l = a.env);
    var n = [];
    a && a.args && (n = a.args);
    var r = pb;
    a && a.bindings && (r = a.bindings);
    this.view = this.memory = void 0;
    this.bindings = r;
    this.FD_MAP = new Map([[0, {
      real: 0,
      filetype: 2,
      rights: {
        base: Yb,
        inheriting: k(0)
      },
      path: void 0
    }], [1, {
      real: 1,
      filetype: 2,
      rights: {
        base: Zb,
        inheriting: k(0)
      },
      path: void 0
    }], [2, {
      real: 2,
      filetype: 2,
      rights: {
        base: Zb,
        inheriting: k(0)
      },
      path: void 0
    }]]);
    var p = this.bindings.fs,
        y = this.bindings.path;

    try {
      for (var ua = ca(Object.entries(h)), ea = ua.next(); !ea.done; ea = ua.next()) {
        var rb = da(ea.value, 2),
            fc = rb[0],
            Fb = rb[1],
            gc = p.openSync(Fb, p.constants.O_RDONLY),
            hc = fa(this.FD_MAP.keys()).reverse()[0] + 1;
        this.FD_MAP.set(hc, {
          real: gc,
          filetype: 3,
          rights: {
            base: Rb,
            inheriting: Sb
          },
          fakePath: fc,
          path: Fb
        });
      }
    } catch (t) {
      var Gb = {
        error: t
      };
    } finally {
      try {
        ea && !ea.done && (f = ua.return) && f.call(ua);
      } finally {
        if (Gb) throw Gb.error;
      }
    }

    var ec = r.hrtime();
    this.wasiImport = {
      args_get: function (a, b) {
        g.refreshMemory();
        var c = a,
            d = b;
        n.forEach(function (a) {
          g.view.setUint32(c, d, !0);
          c += 4;
          d += E.from(g.memory.buffer).write(a + "\x00", d);
        });
        return 0;
      },
      args_sizes_get: function (a, b) {
        g.refreshMemory();
        g.view.setUint32(a, n.length, !0);
        a = n.reduce(function (a, b) {
          return a + E.byteLength(b) + 1;
        }, 0);
        g.view.setUint32(b, a, !0);
        return 0;
      },
      environ_get: function (a, b) {
        g.refreshMemory();
        var c = a,
            d = b;
        Object.entries(l).forEach(function (a) {
          var b = da(a, 2);
          a = b[0];
          b = b[1];
          g.view.setUint32(c, d, !0);
          c += 4;
          d += E.from(g.memory.buffer).write(a + "=" + b + "\x00", d);
        });
        return 0;
      },
      environ_sizes_get: function (a, b) {
        g.refreshMemory();
        var c = Object.entries(l).map(function (a) {
          a = da(a, 2);
          return a[0] + "=" + a[1] + "\x00";
        }),
            d = c.reduce(function (a, b) {
          return a + E.byteLength(b);
        }, 0);
        g.view.setUint32(a, c.length, !0);
        g.view.setUint32(b, d, !0);
        return 0;
      },
      clock_res_get: function (a, b) {
        switch (a) {
          case 1:
          case 2:
          case 3:
            var c = k(1);
            break;

          case 0:
            c = k(1E3);
        }

        g.view.setBigUint64(b, c);
        return 0;
      },
      clock_time_get: function (a, c, d) {
        g.refreshMemory();
        a = b(a);
        if (null === a) return 28;
        g.view.setBigUint64(d, k(a), !0);
        return 0;
      },
      fd_advise: Z(function (a) {
        d(a, V);
        return 52;
      }),
      fd_allocate: Z(function (a) {
        d(a, sb);
        return 52;
      }),
      fd_close: Z(function (a) {
        var b = d(a, k(0));
        p.closeSync(b.real);
        g.FD_MAP.delete(a);
        return 0;
      }),
      fd_datasync: Z(function (a) {
        a = d(a, O);
        p.fdatasyncSync(a.real);
        return 0;
      }),
      fd_fdstat_get: Z(function (a, b) {
        a = d(a, k(0));
        g.refreshMemory();
        g.view.setUint8(b, a.filetype);
        g.view.setUint16(b + 2, 0, !0);
        g.view.setUint16(b + 4, 0, !0);
        g.view.setBigUint64(b + 8, k(a.rights.base), !0);
        g.view.setBigUint64(b + 8 + 8, k(a.rights.inheriting), !0);
        return 0;
      }),
      fd_fdstat_set_flags: Z(function (a) {
        d(a, R);
        return 52;
      }),
      fd_fdstat_set_rights: Z(function (a, b, c) {
        a = d(a, k(0));
        if ((a.rights.base | b) > a.rights.base || (a.rights.inheriting | c) > a.rights.inheriting) return 63;
        a.rights.base = b;
        a.rights.inheriting = c;
        return 0;
      }),
      fd_filestat_get: Z(function (a, b) {
        a = d(a, W);
        var c = p.fstatSync(a.real);
        g.refreshMemory();
        g.view.setBigUint64(b, k(c.dev), !0);
        b += 8;
        g.view.setBigUint64(b, k(c.ino), !0);
        b += 8;
        g.view.setUint8(b, a.filetype);
        b += 8;
        g.view.setBigUint64(b, k(c.nlink), !0);
        b += 8;
        g.view.setBigUint64(b, k(c.size), !0);
        b += 8;
        g.view.setBigUint64(b, Y(c.atimeMs), !0);
        b += 8;
        g.view.setBigUint64(b, Y(c.mtimeMs), !0);
        g.view.setBigUint64(b + 8, Y(c.ctimeMs), !0);
        return 0;
      }),
      fd_filestat_set_size: Z(function (a, b) {
        a = d(a, Ib);
        p.ftruncateSync(a.real, Number(b));
        return 0;
      }),
      fd_filestat_set_times: Z(function (a, c, e, g) {
        a = d(a, Jb);
        var f = p.fstatSync(a.real),
            t = f.atime;
        f = f.mtime;
        var q = $b(b(0));
        if (3 === (g & 3) || 12 === (g & 12)) return 28;
        1 === (g & 1) ? t = $b(c) : 2 === (g & 2) && (t = q);
        4 === (g & 4) ? f = $b(e) : 8 === (g & 8) && (f = q);
        p.futimesSync(a.real, new Date(t), new Date(f));
        return 0;
      }),
      fd_prestat_get: Z(function (a, b) {
        a = d(a, k(0));
        if (!a.path) return 28;
        g.refreshMemory();
        g.view.setUint8(b, 0);
        g.view.setUint32(b + 4, E.byteLength(a.fakePath), !0);
        return 0;
      }),
      fd_prestat_dir_name: Z(function (a, b, c) {
        a = d(a, k(0));
        if (!a.path) return 28;
        g.refreshMemory();
        E.from(g.memory.buffer).write(a.fakePath, b, c, "utf8");
        return 0;
      }),
      fd_pwrite: Z(function (a, b, c, f, h) {
        var t = d(a, T | Q),
            q = 0;
        e(b, c).forEach(function (a) {
          for (var b = 0; b < a.byteLength;) b += p.writeSync(t.real, a, b, a.byteLength - b, Number(f) + q + b);

          q += b;
        });
        g.view.setUint32(h, q, !0);
        return 0;
      }),
      fd_write: Z(function (a, b, c, f) {
        var t = d(a, T),
            q = 0;
        e(b, c).forEach(function (a) {
          for (var b = 0; b < a.byteLength;) {
            var c = p.writeSync(t.real, a, b, a.byteLength - b, t.offset ? Number(t.offset) : null);
            t.offset && (t.offset += k(c));
            b += c;
          }

          q += b;
        });
        g.view.setUint32(f, q, !0);
        return 0;
      }),
      fd_pread: Z(function (a, b, c, f, h) {
        var t;
        a = d(a, P | Q);
        var q = 0;

        try {
          var x = ca(e(b, c)),
              l = x.next();

          a: for (; !l.done; l = x.next()) {
            var n = l.value;

            for (b = 0; b < n.byteLength;) {
              var ic = n.byteLength - b,
                  B = p.readSync(a.real, n, b, n.byteLength - b, Number(f) + q + b);
              b += B;
              q += B;
              if (0 === B || B < ic) break a;
            }

            q += b;
          }
        } catch (U) {
          var r = {
            error: U
          };
        } finally {
          try {
            l && !l.done && (t = x.return) && t.call(x);
          } finally {
            if (r) throw r.error;
          }
        }

        g.view.setUint32(h, q, !0);
        return 0;
      }),
      fd_read: Z(function (a, b, c, f) {
        var t;
        a = d(a, P);
        var q = 0 === a.real,
            h = 0;

        try {
          var x = ca(e(b, c)),
              l = x.next();

          a: for (; !l.done; l = x.next()) {
            var n = l.value;

            for (b = 0; b < n.byteLength;) {
              var B = n.byteLength - b,
                  r = p.readSync(a.real, n, b, B, q || void 0 === a.offset ? null : Number(a.offset));
              q || (a.offset = (a.offset ? a.offset : k(0)) + k(r));
              b += r;
              h += r;
              if (0 === r || r < B) break a;
            }
          }
        } catch (U) {
          var y = {
            error: U
          };
        } finally {
          try {
            l && !l.done && (t = x.return) && t.call(x);
          } finally {
            if (y) throw y.error;
          }
        }

        g.view.setUint32(f, h, !0);
        return 0;
      }),
      fd_readdir: Z(function (a, b, c, e, f) {
        a = d(a, yb);
        g.refreshMemory();
        var t = p.readdirSync(a.path, {
          withFileTypes: !0
        }),
            q = b;

        for (e = Number(e); e < t.length; e += 1) {
          var h = t[e],
              x = E.byteLength(h.name);
          if (b - q > c) break;
          g.view.setBigUint64(b, k(e + 1), !0);
          b += 8;
          if (b - q > c) break;
          var l = p.statSync(y.resolve(a.path, h.name));
          g.view.setBigUint64(b, k(l.ino), !0);
          b += 8;
          if (b - q > c) break;
          g.view.setUint32(b, x, !0);
          b += 4;
          if (b - q > c) break;

          switch (!0) {
            case l.isBlockDevice():
              l = 1;
              break;

            case l.isCharacterDevice():
              l = 2;
              break;

            case l.isDirectory():
              l = 3;
              break;

            case l.isFIFO():
              l = 6;
              break;

            case l.isFile():
              l = 4;
              break;

            case l.isSocket():
              l = 6;
              break;

            case l.isSymbolicLink():
              l = 7;
              break;

            default:
              l = 0;
          }

          g.view.setUint8(b, l);
          b += 1;
          b += 3;
          if (b + x >= q + c) break;
          E.from(g.memory.buffer).write(h.name, b);
          b += x;
        }

        g.view.setUint32(f, Math.min(b - q, c), !0);
        return 0;
      }),
      fd_renumber: Z(function (a, b) {
        d(a, k(0));
        d(b, k(0));
        p.closeSync(g.FD_MAP.get(a).real);
        g.FD_MAP.set(a, g.FD_MAP.get(b));
        g.FD_MAP.delete(b);
        return 0;
      }),
      fd_seek: Z(function (a, b, c, e) {
        a = d(a, Q);
        g.refreshMemory();

        switch (c) {
          case 1:
            a.offset = (a.offset ? a.offset : k(0)) + k(b);
            break;

          case 2:
            c = p.fstatSync(a.real).size;
            a.offset = k(c) + k(b);
            break;

          case 0:
            a.offset = k(b);
        }

        g.view.setBigUint64(e, a.offset, !0);
        return 0;
      }),
      fd_tell: Z(function (a, b) {
        a = d(a, qb);
        g.refreshMemory();
        a.offset || (a.offset = k(0));
        g.view.setBigUint64(b, a.offset, !0);
        return 0;
      }),
      fd_sync: Z(function (a) {
        a = d(a, S);
        p.fsyncSync(a.real);
        return 0;
      }),
      path_create_directory: Z(function (a, b, c) {
        a = d(a, tb);
        if (!a.path) return 28;
        g.refreshMemory();
        b = E.from(g.memory.buffer, b, c).toString();
        p.mkdirSync(y.resolve(a.path, b));
        return 0;
      }),
      path_filestat_get: Z(function (a, b, c, e, f) {
        a = d(a, Cb);
        if (!a.path) return 28;
        g.refreshMemory();
        c = E.from(g.memory.buffer, c, e).toString();
        c = p.statSync(y.resolve(a.path, c));
        g.view.setBigUint64(f, k(c.dev), !0);
        f += 8;
        g.view.setBigUint64(f, k(c.ino), !0);
        f += 8;
        g.view.setUint8(f, cc(g, void 0, c).filetype);
        f += 8;
        g.view.setBigUint64(f, k(c.nlink), !0);
        f += 8;
        g.view.setBigUint64(f, k(c.size), !0);
        f += 8;
        g.view.setBigUint64(f, Y(c.atimeMs), !0);
        f += 8;
        g.view.setBigUint64(f, Y(c.mtimeMs), !0);
        g.view.setBigUint64(f + 8, Y(c.ctimeMs), !0);
        return 0;
      }),
      path_filestat_set_times: Z(function (a, c, e, f, h, l, n) {
        a = d(a, Eb);
        if (!a.path) return 28;
        g.refreshMemory();
        var t = p.fstatSync(a.real);
        c = t.atime;
        t = t.mtime;
        var q = $b(b(0));
        if (3 === (n & 3) || 12 === (n & 12)) return 28;
        1 === (n & 1) ? c = $b(h) : 2 === (n & 2) && (c = q);
        4 === (n & 4) ? t = $b(l) : 8 === (n & 8) && (t = q);
        e = E.from(g.memory.buffer, e, f).toString();
        p.utimesSync(y.resolve(a.path, e), new Date(c), new Date(t));
        return 0;
      }),
      path_link: Z(function (a, b, c, e, f, h, l) {
        a = d(a, vb);
        f = d(f, wb);
        if (!a.path || !f.path) return 28;
        g.refreshMemory();
        c = E.from(g.memory.buffer, c, e).toString();
        h = E.from(g.memory.buffer, h, l).toString();
        p.linkSync(y.resolve(a.path, c), y.resolve(f.path, h));
        return 0;
      }),
      path_open: Z(function (a, b, c, e, f, h, l, n, r) {
        b = d(a, xb);
        h = k(h);
        l = k(l);
        a = (h & (P | yb)) !== k(0);
        var t = (h & (O | T | sb | Ib)) !== k(0);
        if (t && a) var q = p.constants.O_RDWR;else a ? q = p.constants.O_RDONLY : t && (q = p.constants.O_WRONLY);
        a = h | xb;
        h |= l;
        0 !== (f & 1) && (q |= p.constants.O_CREAT, a |= ub);
        0 !== (f & 2) && (q |= p.constants.O_DIRECTORY);
        0 !== (f & 4) && (q |= p.constants.O_EXCL);
        0 !== (f & 8) && (q |= p.constants.O_TRUNC, a |= Db);
        0 !== (n & 1) && (q |= p.constants.O_APPEND);
        0 !== (n & 2) && (q = p.constants.O_DSYNC ? q | p.constants.O_DSYNC : q | p.constants.O_SYNC, h |= O);
        0 !== (n & 4) && (q |= p.constants.O_NONBLOCK);
        0 !== (n & 8) && (q = p.constants.O_RSYNC ? q | p.constants.O_RSYNC : q | p.constants.O_SYNC, h |= S);
        0 !== (n & 16) && (q |= p.constants.O_SYNC, h |= S);
        t && 0 === (q & (p.constants.O_APPEND | p.constants.O_TRUNC)) && (h |= Q);
        g.refreshMemory();
        c = E.from(g.memory.buffer, c, e).toString();
        c = y.resolve(b.path, c);
        if (y.relative(b.path, c).startsWith("..")) return 76;

        try {
          var x = p.realpathSync(c);
          if (y.relative(b.path, x).startsWith("..")) return 76;
        } catch (U) {
          if ("ENOENT" === U.code) x = c;else throw U;
        }

        try {
          var B = p.statSync(x).isDirectory();
        } catch (U) {}

        q = !t && B ? p.openSync(x, p.constants.O_RDONLY) : p.openSync(x, q);
        B = fa(g.FD_MAP.keys()).reverse()[0] + 1;
        g.FD_MAP.set(B, {
          real: q,
          filetype: void 0,
          rights: {
            base: a,
            inheriting: h
          },
          path: x
        });
        bc(g, B);
        g.view.setUint32(r, B, !0);
        return 0;
      }),
      path_readlink: Z(function (a, b, c, e, f, h) {
        a = d(a, zb);
        if (!a.path) return 28;
        g.refreshMemory();
        b = E.from(g.memory.buffer, b, c).toString();
        b = y.resolve(a.path, b);
        b = p.readlinkSync(b);
        e = E.from(g.memory.buffer).write(b, e, f);
        g.view.setUint32(h, e, !0);
        return 0;
      }),
      path_remove_directory: Z(function (a, b, c) {
        a = d(a, Lb);
        if (!a.path) return 28;
        g.refreshMemory();
        b = E.from(g.memory.buffer, b, c).toString();
        p.rmdirSync(y.resolve(a.path, b));
        return 0;
      }),
      path_rename: Z(function (a, b, c, e, f, h) {
        a = d(a, Ab);
        e = d(e, Bb);
        if (!a.path || !e.path) return 28;
        g.refreshMemory();
        b = E.from(g.memory.buffer, b, c).toString();
        f = E.from(g.memory.buffer, f, h).toString();
        p.renameSync(y.resolve(a.path, b), y.resolve(e.path, f));
        return 0;
      }),
      path_symlink: Z(function (a, b, c, e, f) {
        c = d(c, Kb);
        if (!c.path) return 28;
        g.refreshMemory();
        a = E.from(g.memory.buffer, a, b).toString();
        e = E.from(g.memory.buffer, e, f).toString();
        p.symlinkSync(a, y.resolve(c.path, e));
        return 0;
      }),
      path_unlink_file: Z(function (a, b, c) {
        a = d(a, Mb);
        if (!a.path) return 28;
        g.refreshMemory();
        b = E.from(g.memory.buffer, b, c).toString();
        p.unlinkSync(y.resolve(a.path, b));
        return 0;
      }),
      poll_oneoff: function (a, c, d, e) {
        var f = 0,
            h = 0;
        g.refreshMemory();

        for (var l = 0; l < d; l += 1) {
          var n = g.view.getBigUint64(a, !0);
          a += 8;
          var p = g.view.getUint8(a);
          a += 1;

          switch (p) {
            case 0:
              a += 7;
              g.view.getBigUint64(a, !0);
              a += 8;
              var q = g.view.getUint32(a, !0);
              a += 4;
              a += 4;
              p = g.view.getBigUint64(a, !0);
              a += 8;
              g.view.getBigUint64(a, !0);
              a += 8;
              var t = g.view.getUint16(a, !0);
              a += 2;
              a += 6;
              var x = 1 === t;
              t = 0;
              q = k(b(q));
              null === q ? t = 28 : (p = x ? p : q + p, h = p > h ? p : h);
              g.view.setBigUint64(c, n, !0);
              c += 8;
              g.view.setUint16(c, t, !0);
              c += 2;
              g.view.setUint8(c, 0);
              c += 1;
              c += 5;
              f += 1;
              break;

            case 1:
            case 2:
              a += 3;
              g.view.getUint32(a, !0);
              a += 4;
              g.view.setBigUint64(c, n, !0);
              c += 8;
              g.view.setUint16(c, 52, !0);
              c += 2;
              g.view.setUint8(c, p);
              c += 1;
              c += 5;
              f += 1;
              break;

            default:
              return 28;
          }
        }

        for (g.view.setUint32(e, f, !0); r.hrtime() < h;);

        return 0;
      },
      proc_exit: function (a) {
        r.exit(a);
        return 0;
      },
      proc_raise: function (a) {
        if (!(a in Xb)) return 28;
        r.kill(Xb[a]);
        return 0;
      },
      random_get: function (a, b) {
        g.refreshMemory();
        r.randomFillSync(new Uint8Array(g.memory.buffer), a, b);
        return 0;
      },
      sched_yield: function () {
        return 0;
      },
      sock_recv: function () {
        return 52;
      },
      sock_send: function () {
        return 52;
      },
      sock_shutdown: function () {
        return 52;
      }
    };
    a.traceSyscalls && Object.keys(this.wasiImport).forEach(function (a) {
      var b = g.wasiImport[a];

      g.wasiImport[a] = function () {
        for (var c = [], d = 0; d < arguments.length; d++) c[d] = arguments[d];

        console.log("WASI: wasiImport called: " + a + " (" + c + ")");

        try {
          var e = b.apply(void 0, fa(c));
          console.log("WASI:  => " + e);
          return e;
        } catch (Hb) {
          throw console.log("Catched error: " + Hb), Hb;
        }
      };
    });
  }

  a.prototype.refreshMemory = function () {
    this.view && 0 !== this.view.buffer.byteLength || (this.view = new ia(this.memory.buffer));
  };

  a.prototype.setMemory = function (a) {
    this.memory = a;
  };

  a.prototype.start = function (a) {
    a = a.exports;
    if (null === a || "object" !== typeof a) throw Error("instance.exports must be an Object. Received " + a + ".");
    var b = a.memory;
    if (!(b instanceof WebAssembly.Memory)) throw Error("instance.exports.memory must be a WebAssembly.Memory. Recceived " + b + ".");
    this.setMemory(b);
    a._start && a._start();
  };

  a.prototype.getImportNamespace = function (a) {
    var b,
        d = null;

    try {
      for (var e = ca(WebAssembly.Module.imports(a)), f = e.next(); !f.done; f = e.next()) {
        var g = f.value;
        if ("function" === g.kind && g.module.startsWith("wasi_")) if (!d) d = g.module;else if (d !== g.module) throw Error("Multiple namespaces detected.");
      }
    } catch (l) {
      var h = {
        error: l
      };
    } finally {
      try {
        f && !f.done && (b = e.return) && b.call(e);
      } finally {
        if (h) throw h.error;
      }
    }

    return d;
  };

  a.prototype.getImports = function (a) {
    switch (this.getImportNamespace(a)) {
      case "wasi_unstable":
        return {
          wasi_unstable: this.wasiImport
        };

      case "wasi_snapshot_preview1":
        return {
          wasi_snapshot_preview1: this.wasiImport
        };

      default:
        throw Error("Can't detect a WASI namespace for the WebAssembly Module");
    }
  };

  a.defaultBindings = pb;
  return a;
}();

exports.WASI = dc;
exports.WASIKillError = ob;
exports.WASIExitError = nb;
exports.WASIError = ac;
var _default = dc;
exports.default = _default;
},{}],"yh9p":[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],"JgNJ":[function(require,module,exports) {
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"REa7":[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],"dskh":[function(require,module,exports) {

var global = arguments[3];
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":"yh9p","ieee754":"JgNJ","isarray":"REa7","buffer":"dskh"}],"Wugr":[function(require,module,exports) {

/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":"dskh"}],"pBGv":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"XJNj":[function(require,module,exports) {

var global = arguments[3];
var process = require("process");
'use strict'

// limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
var MAX_BYTES = 65536

// Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
var MAX_UINT32 = 4294967295

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = require('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

  var bytes = Buffer.allocUnsafe(size)

  if (size > 0) {  // getRandomValues fails on IE if size == 0
    if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
      // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
      for (var generated = 0; generated < size; generated += MAX_BYTES) {
        // buffer.slice automatically checks if the end is past the end of
        // the buffer so we don't have to here
        crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES))
      }
    } else {
      crypto.getRandomValues(bytes)
    }
  }

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

},{"safe-buffer":"Wugr","process":"pBGv"}],"ODza":[function(require,module,exports) {

var global = arguments[3];
var process = require("process");
'use strict';

function oldBrowser() {
  throw new Error('secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11');
}

var safeBuffer = require('safe-buffer');

var randombytes = require('randombytes');

var Buffer = safeBuffer.Buffer;
var kBufferMaxLength = safeBuffer.kMaxLength;
var crypto = global.crypto || global.msCrypto;
var kMaxUint32 = Math.pow(2, 32) - 1;

function assertOffset(offset, length) {
  if (typeof offset !== 'number' || offset !== offset) {
    // eslint-disable-line no-self-compare
    throw new TypeError('offset must be a number');
  }

  if (offset > kMaxUint32 || offset < 0) {
    throw new TypeError('offset must be a uint32');
  }

  if (offset > kBufferMaxLength || offset > length) {
    throw new RangeError('offset out of range');
  }
}

function assertSize(size, offset, length) {
  if (typeof size !== 'number' || size !== size) {
    // eslint-disable-line no-self-compare
    throw new TypeError('size must be a number');
  }

  if (size > kMaxUint32 || size < 0) {
    throw new TypeError('size must be a uint32');
  }

  if (size + offset > length || size > kBufferMaxLength) {
    throw new RangeError('buffer too small');
  }
}

if (crypto && crypto.getRandomValues || !true) {
  exports.randomFill = randomFill;
  exports.randomFillSync = randomFillSync;
} else {
  exports.randomFill = oldBrowser;
  exports.randomFillSync = oldBrowser;
}

function randomFill(buf, offset, size, cb) {
  if (!Buffer.isBuffer(buf) && !(buf instanceof global.Uint8Array)) {
    throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
  }

  if (typeof offset === 'function') {
    cb = offset;
    offset = 0;
    size = buf.length;
  } else if (typeof size === 'function') {
    cb = size;
    size = buf.length - offset;
  } else if (typeof cb !== 'function') {
    throw new TypeError('"cb" argument must be a function');
  }

  assertOffset(offset, buf.length);
  assertSize(size, offset, buf.length);
  return actualFill(buf, offset, size, cb);
}

function actualFill(buf, offset, size, cb) {
  if (true) {
    var ourBuf = buf.buffer;
    var uint = new Uint8Array(ourBuf, offset, size);
    crypto.getRandomValues(uint);

    if (cb) {
      process.nextTick(function () {
        cb(null, buf);
      });
      return;
    }

    return buf;
  }

  if (cb) {
    randombytes(size, function (err, bytes) {
      if (err) {
        return cb(err);
      }

      bytes.copy(buf, offset);
      cb(null, buf);
    });
    return;
  }

  var bytes = randombytes(size);
  bytes.copy(buf, offset);
  return buf;
}

function randomFillSync(buf, offset, size) {
  if (typeof offset === 'undefined') {
    offset = 0;
  }

  if (!Buffer.isBuffer(buf) && !(buf instanceof global.Uint8Array)) {
    throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
  }

  assertOffset(offset, buf.length);
  if (size === undefined) size = buf.length - offset;
  assertSize(size, offset, buf.length);
  return actualFill(buf, offset, size);
}
},{"safe-buffer":"Wugr","randombytes":"XJNj","process":"pBGv"}],"RBKZ":[function(require,module,exports) {
"use strict";
// hrtime polyfill for the browser
Object.defineProperty(exports, "__esModule", { value: true });
const baseNow = Math.floor((Date.now() - performance.now()) * 1e-3);
function hrtime(previousTimestamp) {
    // initilaize our variables
    let clocktime = performance.now() * 1e-3;
    let seconds = Math.floor(clocktime) + baseNow;
    let nanoseconds = Math.floor((clocktime % 1) * 1e9);
    // Compare to the prvious timestamp if we have one
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1e9;
        }
    }
    // Return our seconds tuple
    return [seconds, nanoseconds];
}
exports.default = hrtime;

},{}],"X8tR":[function(require,module,exports) {
var process = require("process");
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

},{"process":"pBGv"}],"FkpS":[function(require,module,exports) {
var global = arguments[3];
"use strict";
// A very simple workaround for Big int. Works in conjunction with our custom
// Dataview workaround at ./dataview.ts
Object.defineProperty(exports, "__esModule", { value: true });
const globalObj = typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
        ? global
        : {};
exports.BigIntPolyfill = typeof BigInt !== "undefined" ? BigInt : globalObj.BigInt || Number;

},{}],"tqnP":[function(require,module,exports) {
"use strict";
// A very simple workaround for Big int. Works in conjunction with our custom
// BigInt workaround at ./bigint.ts
Object.defineProperty(exports, "__esModule", { value: true });
const bigint_1 = require("./bigint");
let exportedDataView = DataView;
if (!exportedDataView.prototype.setBigUint64) {
    // Taken from https://gist.github.com/graup/815c9ac65c2bac8a56391f0ca23636fc
    exportedDataView.prototype.setBigUint64 = function (byteOffset, value, littleEndian) {
        let lowWord;
        let highWord;
        if (value < 2 ** 32) {
            lowWord = Number(value);
            highWord = 0;
        }
        else {
            var bigNumberAsBinaryStr = value.toString(2);
            // Convert the above binary str to 64 bit (actually 52 bit will work) by padding zeros in the left
            var bigNumberAsBinaryStr2 = "";
            for (var i = 0; i < 64 - bigNumberAsBinaryStr.length; i++) {
                bigNumberAsBinaryStr2 += "0";
            }
            bigNumberAsBinaryStr2 += bigNumberAsBinaryStr;
            highWord = parseInt(bigNumberAsBinaryStr2.substring(0, 32), 2);
            lowWord = parseInt(bigNumberAsBinaryStr2.substring(32), 2);
        }
        this.setUint32(byteOffset + (littleEndian ? 0 : 4), lowWord, littleEndian);
        this.setUint32(byteOffset + (littleEndian ? 4 : 0), highWord, littleEndian);
    };
    exportedDataView.prototype.getBigUint64 = function (byteOffset, littleEndian) {
        let lowWord = this.getUint32(byteOffset + (littleEndian ? 0 : 4), littleEndian);
        let highWord = this.getUint32(byteOffset + (littleEndian ? 4 : 0), littleEndian);
        var lowWordAsBinaryStr = lowWord.toString(2);
        var highWordAsBinaryStr = highWord.toString(2);
        // Convert the above binary str to 64 bit (actually 52 bit will work) by padding zeros in the left
        var lowWordAsBinaryStrPadded = "";
        for (var i = 0; i < 32 - lowWordAsBinaryStr.length; i++) {
            lowWordAsBinaryStrPadded += "0";
        }
        lowWordAsBinaryStrPadded += lowWordAsBinaryStr;
        return bigint_1.BigIntPolyfill("0b" + highWordAsBinaryStr + lowWordAsBinaryStrPadded);
    };
}
exports.DataViewPolyfill = exportedDataView;

},{"./bigint":"FkpS"}],"kKJo":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict";
// Return our buffer depending on browser or node
Object.defineProperty(exports, "__esModule", { value: true });
/*ROLLUP_REPLACE_BROWSER
// @ts-ignore
import { Buffer } from "buffer-es6";
ROLLUP_REPLACE_BROWSER*/
const isomorphicBuffer = Buffer;
exports.default = isomorphicBuffer;

},{"buffer":"dskh"}],"cJdk":[function(require,module,exports) {
"use strict";
/*

This project is based from the Node implementation made by Gus Caplan
https://github.com/devsnek/node-wasi
However, JavaScript WASI is focused on:
 * Bringing WASI to the Browsers
 * Make easy to plug different filesystems
 * Provide a type-safe api using Typescript


Copyright 2019 Gus Caplan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.

 */
Object.defineProperty(exports, "__esModule", { value: true });
const bigint_1 = require("./polyfills/bigint");
exports.WASI_ESUCCESS = 0;
exports.WASI_E2BIG = 1;
exports.WASI_EACCES = 2;
exports.WASI_EADDRINUSE = 3;
exports.WASI_EADDRNOTAVAIL = 4;
exports.WASI_EAFNOSUPPORT = 5;
exports.WASI_EAGAIN = 6;
exports.WASI_EALREADY = 7;
exports.WASI_EBADF = 8;
exports.WASI_EBADMSG = 9;
exports.WASI_EBUSY = 10;
exports.WASI_ECANCELED = 11;
exports.WASI_ECHILD = 12;
exports.WASI_ECONNABORTED = 13;
exports.WASI_ECONNREFUSED = 14;
exports.WASI_ECONNRESET = 15;
exports.WASI_EDEADLK = 16;
exports.WASI_EDESTADDRREQ = 17;
exports.WASI_EDOM = 18;
exports.WASI_EDQUOT = 19;
exports.WASI_EEXIST = 20;
exports.WASI_EFAULT = 21;
exports.WASI_EFBIG = 22;
exports.WASI_EHOSTUNREACH = 23;
exports.WASI_EIDRM = 24;
exports.WASI_EILSEQ = 25;
exports.WASI_EINPROGRESS = 26;
exports.WASI_EINTR = 27;
exports.WASI_EINVAL = 28;
exports.WASI_EIO = 29;
exports.WASI_EISCONN = 30;
exports.WASI_EISDIR = 31;
exports.WASI_ELOOP = 32;
exports.WASI_EMFILE = 33;
exports.WASI_EMLINK = 34;
exports.WASI_EMSGSIZE = 35;
exports.WASI_EMULTIHOP = 36;
exports.WASI_ENAMETOOLONG = 37;
exports.WASI_ENETDOWN = 38;
exports.WASI_ENETRESET = 39;
exports.WASI_ENETUNREACH = 40;
exports.WASI_ENFILE = 41;
exports.WASI_ENOBUFS = 42;
exports.WASI_ENODEV = 43;
exports.WASI_ENOENT = 44;
exports.WASI_ENOEXEC = 45;
exports.WASI_ENOLCK = 46;
exports.WASI_ENOLINK = 47;
exports.WASI_ENOMEM = 48;
exports.WASI_ENOMSG = 49;
exports.WASI_ENOPROTOOPT = 50;
exports.WASI_ENOSPC = 51;
exports.WASI_ENOSYS = 52;
exports.WASI_ENOTCONN = 53;
exports.WASI_ENOTDIR = 54;
exports.WASI_ENOTEMPTY = 55;
exports.WASI_ENOTRECOVERABLE = 56;
exports.WASI_ENOTSOCK = 57;
exports.WASI_ENOTSUP = 58;
exports.WASI_ENOTTY = 59;
exports.WASI_ENXIO = 60;
exports.WASI_EOVERFLOW = 61;
exports.WASI_EOWNERDEAD = 62;
exports.WASI_EPERM = 63;
exports.WASI_EPIPE = 64;
exports.WASI_EPROTO = 65;
exports.WASI_EPROTONOSUPPORT = 66;
exports.WASI_EPROTOTYPE = 67;
exports.WASI_ERANGE = 68;
exports.WASI_EROFS = 69;
exports.WASI_ESPIPE = 70;
exports.WASI_ESRCH = 71;
exports.WASI_ESTALE = 72;
exports.WASI_ETIMEDOUT = 73;
exports.WASI_ETXTBSY = 74;
exports.WASI_EXDEV = 75;
exports.WASI_ENOTCAPABLE = 76;
exports.WASI_SIGABRT = 0;
exports.WASI_SIGALRM = 1;
exports.WASI_SIGBUS = 2;
exports.WASI_SIGCHLD = 3;
exports.WASI_SIGCONT = 4;
exports.WASI_SIGFPE = 5;
exports.WASI_SIGHUP = 6;
exports.WASI_SIGILL = 7;
exports.WASI_SIGINT = 8;
exports.WASI_SIGKILL = 9;
exports.WASI_SIGPIPE = 10;
exports.WASI_SIGQUIT = 11;
exports.WASI_SIGSEGV = 12;
exports.WASI_SIGSTOP = 13;
exports.WASI_SIGTERM = 14;
exports.WASI_SIGTRAP = 15;
exports.WASI_SIGTSTP = 16;
exports.WASI_SIGTTIN = 17;
exports.WASI_SIGTTOU = 18;
exports.WASI_SIGURG = 19;
exports.WASI_SIGUSR1 = 20;
exports.WASI_SIGUSR2 = 21;
exports.WASI_SIGVTALRM = 22;
exports.WASI_SIGXCPU = 23;
exports.WASI_SIGXFSZ = 24;
exports.WASI_FILETYPE_UNKNOWN = 0;
exports.WASI_FILETYPE_BLOCK_DEVICE = 1;
exports.WASI_FILETYPE_CHARACTER_DEVICE = 2;
exports.WASI_FILETYPE_DIRECTORY = 3;
exports.WASI_FILETYPE_REGULAR_FILE = 4;
exports.WASI_FILETYPE_SOCKET_DGRAM = 5;
exports.WASI_FILETYPE_SOCKET_STREAM = 6;
exports.WASI_FILETYPE_SYMBOLIC_LINK = 7;
exports.WASI_FDFLAG_APPEND = 0x0001;
exports.WASI_FDFLAG_DSYNC = 0x0002;
exports.WASI_FDFLAG_NONBLOCK = 0x0004;
exports.WASI_FDFLAG_RSYNC = 0x0008;
exports.WASI_FDFLAG_SYNC = 0x0010;
exports.WASI_RIGHT_FD_DATASYNC = bigint_1.BigIntPolyfill(0x0000000000000001);
exports.WASI_RIGHT_FD_READ = bigint_1.BigIntPolyfill(0x0000000000000002);
exports.WASI_RIGHT_FD_SEEK = bigint_1.BigIntPolyfill(0x0000000000000004);
exports.WASI_RIGHT_FD_FDSTAT_SET_FLAGS = bigint_1.BigIntPolyfill(0x0000000000000008);
exports.WASI_RIGHT_FD_SYNC = bigint_1.BigIntPolyfill(0x0000000000000010);
exports.WASI_RIGHT_FD_TELL = bigint_1.BigIntPolyfill(0x0000000000000020);
exports.WASI_RIGHT_FD_WRITE = bigint_1.BigIntPolyfill(0x0000000000000040);
exports.WASI_RIGHT_FD_ADVISE = bigint_1.BigIntPolyfill(0x0000000000000080);
exports.WASI_RIGHT_FD_ALLOCATE = bigint_1.BigIntPolyfill(0x0000000000000100);
exports.WASI_RIGHT_PATH_CREATE_DIRECTORY = bigint_1.BigIntPolyfill(0x0000000000000200);
exports.WASI_RIGHT_PATH_CREATE_FILE = bigint_1.BigIntPolyfill(0x0000000000000400);
exports.WASI_RIGHT_PATH_LINK_SOURCE = bigint_1.BigIntPolyfill(0x0000000000000800);
exports.WASI_RIGHT_PATH_LINK_TARGET = bigint_1.BigIntPolyfill(0x0000000000001000);
exports.WASI_RIGHT_PATH_OPEN = bigint_1.BigIntPolyfill(0x0000000000002000);
exports.WASI_RIGHT_FD_READDIR = bigint_1.BigIntPolyfill(0x0000000000004000);
exports.WASI_RIGHT_PATH_READLINK = bigint_1.BigIntPolyfill(0x0000000000008000);
exports.WASI_RIGHT_PATH_RENAME_SOURCE = bigint_1.BigIntPolyfill(0x0000000000010000);
exports.WASI_RIGHT_PATH_RENAME_TARGET = bigint_1.BigIntPolyfill(0x0000000000020000);
exports.WASI_RIGHT_PATH_FILESTAT_GET = bigint_1.BigIntPolyfill(0x0000000000040000);
exports.WASI_RIGHT_PATH_FILESTAT_SET_SIZE = bigint_1.BigIntPolyfill(0x0000000000080000);
exports.WASI_RIGHT_PATH_FILESTAT_SET_TIMES = bigint_1.BigIntPolyfill(0x0000000000100000);
exports.WASI_RIGHT_FD_FILESTAT_GET = bigint_1.BigIntPolyfill(0x0000000000200000);
exports.WASI_RIGHT_FD_FILESTAT_SET_SIZE = bigint_1.BigIntPolyfill(0x0000000000400000);
exports.WASI_RIGHT_FD_FILESTAT_SET_TIMES = bigint_1.BigIntPolyfill(0x0000000000800000);
exports.WASI_RIGHT_PATH_SYMLINK = bigint_1.BigIntPolyfill(0x0000000001000000);
exports.WASI_RIGHT_PATH_REMOVE_DIRECTORY = bigint_1.BigIntPolyfill(0x0000000002000000);
exports.WASI_RIGHT_PATH_UNLINK_FILE = bigint_1.BigIntPolyfill(0x0000000004000000);
exports.WASI_RIGHT_POLL_FD_READWRITE = bigint_1.BigIntPolyfill(0x0000000008000000);
exports.WASI_RIGHT_SOCK_SHUTDOWN = bigint_1.BigIntPolyfill(0x0000000010000000);
exports.RIGHTS_ALL = exports.WASI_RIGHT_FD_DATASYNC |
    exports.WASI_RIGHT_FD_READ |
    exports.WASI_RIGHT_FD_SEEK |
    exports.WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    exports.WASI_RIGHT_FD_SYNC |
    exports.WASI_RIGHT_FD_TELL |
    exports.WASI_RIGHT_FD_WRITE |
    exports.WASI_RIGHT_FD_ADVISE |
    exports.WASI_RIGHT_FD_ALLOCATE |
    exports.WASI_RIGHT_PATH_CREATE_DIRECTORY |
    exports.WASI_RIGHT_PATH_CREATE_FILE |
    exports.WASI_RIGHT_PATH_LINK_SOURCE |
    exports.WASI_RIGHT_PATH_LINK_TARGET |
    exports.WASI_RIGHT_PATH_OPEN |
    exports.WASI_RIGHT_FD_READDIR |
    exports.WASI_RIGHT_PATH_READLINK |
    exports.WASI_RIGHT_PATH_RENAME_SOURCE |
    exports.WASI_RIGHT_PATH_RENAME_TARGET |
    exports.WASI_RIGHT_PATH_FILESTAT_GET |
    exports.WASI_RIGHT_PATH_FILESTAT_SET_SIZE |
    exports.WASI_RIGHT_PATH_FILESTAT_SET_TIMES |
    exports.WASI_RIGHT_FD_FILESTAT_GET |
    exports.WASI_RIGHT_FD_FILESTAT_SET_TIMES |
    exports.WASI_RIGHT_FD_FILESTAT_SET_SIZE |
    exports.WASI_RIGHT_PATH_SYMLINK |
    exports.WASI_RIGHT_PATH_UNLINK_FILE |
    exports.WASI_RIGHT_PATH_REMOVE_DIRECTORY |
    exports.WASI_RIGHT_POLL_FD_READWRITE |
    exports.WASI_RIGHT_SOCK_SHUTDOWN;
exports.RIGHTS_BLOCK_DEVICE_BASE = exports.RIGHTS_ALL;
exports.RIGHTS_BLOCK_DEVICE_INHERITING = exports.RIGHTS_ALL;
exports.RIGHTS_CHARACTER_DEVICE_BASE = exports.RIGHTS_ALL;
exports.RIGHTS_CHARACTER_DEVICE_INHERITING = exports.RIGHTS_ALL;
exports.RIGHTS_REGULAR_FILE_BASE = exports.WASI_RIGHT_FD_DATASYNC |
    exports.WASI_RIGHT_FD_READ |
    exports.WASI_RIGHT_FD_SEEK |
    exports.WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    exports.WASI_RIGHT_FD_SYNC |
    exports.WASI_RIGHT_FD_TELL |
    exports.WASI_RIGHT_FD_WRITE |
    exports.WASI_RIGHT_FD_ADVISE |
    exports.WASI_RIGHT_FD_ALLOCATE |
    exports.WASI_RIGHT_FD_FILESTAT_GET |
    exports.WASI_RIGHT_FD_FILESTAT_SET_SIZE |
    exports.WASI_RIGHT_FD_FILESTAT_SET_TIMES |
    exports.WASI_RIGHT_POLL_FD_READWRITE;
exports.RIGHTS_REGULAR_FILE_INHERITING = bigint_1.BigIntPolyfill(0);
exports.RIGHTS_DIRECTORY_BASE = exports.WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    exports.WASI_RIGHT_FD_SYNC |
    exports.WASI_RIGHT_FD_ADVISE |
    exports.WASI_RIGHT_PATH_CREATE_DIRECTORY |
    exports.WASI_RIGHT_PATH_CREATE_FILE |
    exports.WASI_RIGHT_PATH_LINK_SOURCE |
    exports.WASI_RIGHT_PATH_LINK_TARGET |
    exports.WASI_RIGHT_PATH_OPEN |
    exports.WASI_RIGHT_FD_READDIR |
    exports.WASI_RIGHT_PATH_READLINK |
    exports.WASI_RIGHT_PATH_RENAME_SOURCE |
    exports.WASI_RIGHT_PATH_RENAME_TARGET |
    exports.WASI_RIGHT_PATH_FILESTAT_GET |
    exports.WASI_RIGHT_PATH_FILESTAT_SET_SIZE |
    exports.WASI_RIGHT_PATH_FILESTAT_SET_TIMES |
    exports.WASI_RIGHT_FD_FILESTAT_GET |
    exports.WASI_RIGHT_FD_FILESTAT_SET_TIMES |
    exports.WASI_RIGHT_PATH_SYMLINK |
    exports.WASI_RIGHT_PATH_UNLINK_FILE |
    exports.WASI_RIGHT_PATH_REMOVE_DIRECTORY |
    exports.WASI_RIGHT_POLL_FD_READWRITE;
exports.RIGHTS_DIRECTORY_INHERITING = exports.RIGHTS_DIRECTORY_BASE | exports.RIGHTS_REGULAR_FILE_BASE;
exports.RIGHTS_SOCKET_BASE = exports.WASI_RIGHT_FD_READ |
    exports.WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    exports.WASI_RIGHT_FD_WRITE |
    exports.WASI_RIGHT_FD_FILESTAT_GET |
    exports.WASI_RIGHT_POLL_FD_READWRITE |
    exports.WASI_RIGHT_SOCK_SHUTDOWN;
exports.RIGHTS_SOCKET_INHERITING = exports.RIGHTS_ALL;
exports.RIGHTS_TTY_BASE = exports.WASI_RIGHT_FD_READ |
    exports.WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    exports.WASI_RIGHT_FD_WRITE |
    exports.WASI_RIGHT_FD_FILESTAT_GET |
    exports.WASI_RIGHT_POLL_FD_READWRITE;
exports.RIGHTS_TTY_INHERITING = bigint_1.BigIntPolyfill(0);
exports.WASI_CLOCK_REALTIME = 0;
exports.WASI_CLOCK_MONOTONIC = 1;
exports.WASI_CLOCK_PROCESS_CPUTIME_ID = 2;
exports.WASI_CLOCK_THREAD_CPUTIME_ID = 3;
exports.WASI_EVENTTYPE_CLOCK = 0;
exports.WASI_EVENTTYPE_FD_READ = 1;
exports.WASI_EVENTTYPE_FD_WRITE = 2;
exports.WASI_FILESTAT_SET_ATIM = 1 << 0;
exports.WASI_FILESTAT_SET_ATIM_NOW = 1 << 1;
exports.WASI_FILESTAT_SET_MTIM = 1 << 2;
exports.WASI_FILESTAT_SET_MTIM_NOW = 1 << 3;
exports.WASI_O_CREAT = 1 << 0;
exports.WASI_O_DIRECTORY = 1 << 1;
exports.WASI_O_EXCL = 1 << 2;
exports.WASI_O_TRUNC = 1 << 3;
exports.WASI_PREOPENTYPE_DIR = 0;
exports.WASI_DIRCOOKIE_START = 0;
exports.WASI_STDIN_FILENO = 0;
exports.WASI_STDOUT_FILENO = 1;
exports.WASI_STDERR_FILENO = 2;
exports.WASI_WHENCE_SET = 0;
exports.WASI_WHENCE_CUR = 1;
exports.WASI_WHENCE_END = 2;
// http://man7.org/linux/man-pages/man3/errno.3.html
exports.ERROR_MAP = {
    E2BIG: exports.WASI_E2BIG,
    EACCES: exports.WASI_EACCES,
    EADDRINUSE: exports.WASI_EADDRINUSE,
    EADDRNOTAVAIL: exports.WASI_EADDRNOTAVAIL,
    EAFNOSUPPORT: exports.WASI_EAFNOSUPPORT,
    EALREADY: exports.WASI_EALREADY,
    EAGAIN: exports.WASI_EAGAIN,
    // EBADE: WASI_EBADE,
    EBADF: exports.WASI_EBADF,
    // EBADFD: WASI_EBADFD,
    EBADMSG: exports.WASI_EBADMSG,
    // EBADR: WASI_EBADR,
    // EBADRQC: WASI_EBADRQC,
    // EBADSLT: WASI_EBADSLT,
    EBUSY: exports.WASI_EBUSY,
    ECANCELED: exports.WASI_ECANCELED,
    ECHILD: exports.WASI_ECHILD,
    // ECHRNG: WASI_ECHRNG,
    // ECOMM: WASI_ECOMM,
    ECONNABORTED: exports.WASI_ECONNABORTED,
    ECONNREFUSED: exports.WASI_ECONNREFUSED,
    ECONNRESET: exports.WASI_ECONNRESET,
    EDEADLOCK: exports.WASI_EDEADLK,
    EDESTADDRREQ: exports.WASI_EDESTADDRREQ,
    EDOM: exports.WASI_EDOM,
    EDQUOT: exports.WASI_EDQUOT,
    EEXIST: exports.WASI_EEXIST,
    EFAULT: exports.WASI_EFAULT,
    EFBIG: exports.WASI_EFBIG,
    EHOSTDOWN: exports.WASI_EHOSTUNREACH,
    EHOSTUNREACH: exports.WASI_EHOSTUNREACH,
    // EHWPOISON: WASI_EHWPOISON,
    EIDRM: exports.WASI_EIDRM,
    EILSEQ: exports.WASI_EILSEQ,
    EINPROGRESS: exports.WASI_EINPROGRESS,
    EINTR: exports.WASI_EINTR,
    EINVAL: exports.WASI_EINVAL,
    EIO: exports.WASI_EIO,
    EISCONN: exports.WASI_EISCONN,
    EISDIR: exports.WASI_EISDIR,
    ELOOP: exports.WASI_ELOOP,
    EMFILE: exports.WASI_EMFILE,
    EMLINK: exports.WASI_EMLINK,
    EMSGSIZE: exports.WASI_EMSGSIZE,
    EMULTIHOP: exports.WASI_EMULTIHOP,
    ENAMETOOLONG: exports.WASI_ENAMETOOLONG,
    ENETDOWN: exports.WASI_ENETDOWN,
    ENETRESET: exports.WASI_ENETRESET,
    ENETUNREACH: exports.WASI_ENETUNREACH,
    ENFILE: exports.WASI_ENFILE,
    ENOBUFS: exports.WASI_ENOBUFS,
    ENODEV: exports.WASI_ENODEV,
    ENOENT: exports.WASI_ENOENT,
    ENOEXEC: exports.WASI_ENOEXEC,
    ENOLCK: exports.WASI_ENOLCK,
    ENOLINK: exports.WASI_ENOLINK,
    ENOMEM: exports.WASI_ENOMEM,
    ENOMSG: exports.WASI_ENOMSG,
    ENOPROTOOPT: exports.WASI_ENOPROTOOPT,
    ENOSPC: exports.WASI_ENOSPC,
    ENOSYS: exports.WASI_ENOSYS,
    ENOTCONN: exports.WASI_ENOTCONN,
    ENOTDIR: exports.WASI_ENOTDIR,
    ENOTEMPTY: exports.WASI_ENOTEMPTY,
    ENOTRECOVERABLE: exports.WASI_ENOTRECOVERABLE,
    ENOTSOCK: exports.WASI_ENOTSOCK,
    ENOTTY: exports.WASI_ENOTTY,
    ENXIO: exports.WASI_ENXIO,
    EOVERFLOW: exports.WASI_EOVERFLOW,
    EOWNERDEAD: exports.WASI_EOWNERDEAD,
    EPERM: exports.WASI_EPERM,
    EPIPE: exports.WASI_EPIPE,
    EPROTO: exports.WASI_EPROTO,
    EPROTONOSUPPORT: exports.WASI_EPROTONOSUPPORT,
    EPROTOTYPE: exports.WASI_EPROTOTYPE,
    ERANGE: exports.WASI_ERANGE,
    EROFS: exports.WASI_EROFS,
    ESPIPE: exports.WASI_ESPIPE,
    ESRCH: exports.WASI_ESRCH,
    ESTALE: exports.WASI_ESTALE,
    ETIMEDOUT: exports.WASI_ETIMEDOUT,
    ETXTBSY: exports.WASI_ETXTBSY,
    EXDEV: exports.WASI_EXDEV
};
exports.SIGNAL_MAP = {
    [exports.WASI_SIGHUP]: "SIGHUP",
    [exports.WASI_SIGINT]: "SIGINT",
    [exports.WASI_SIGQUIT]: "SIGQUIT",
    [exports.WASI_SIGILL]: "SIGILL",
    [exports.WASI_SIGTRAP]: "SIGTRAP",
    [exports.WASI_SIGABRT]: "SIGABRT",
    [exports.WASI_SIGBUS]: "SIGBUS",
    [exports.WASI_SIGFPE]: "SIGFPE",
    [exports.WASI_SIGKILL]: "SIGKILL",
    [exports.WASI_SIGUSR1]: "SIGUSR1",
    [exports.WASI_SIGSEGV]: "SIGSEGV",
    [exports.WASI_SIGUSR2]: "SIGUSR2",
    [exports.WASI_SIGPIPE]: "SIGPIPE",
    [exports.WASI_SIGALRM]: "SIGALRM",
    [exports.WASI_SIGTERM]: "SIGTERM",
    [exports.WASI_SIGCHLD]: "SIGCHLD",
    [exports.WASI_SIGCONT]: "SIGCONT",
    [exports.WASI_SIGSTOP]: "SIGSTOP",
    [exports.WASI_SIGTSTP]: "SIGTSTP",
    [exports.WASI_SIGTTIN]: "SIGTTIN",
    [exports.WASI_SIGTTOU]: "SIGTTOU",
    [exports.WASI_SIGURG]: "SIGURG",
    [exports.WASI_SIGXCPU]: "SIGXCPU",
    [exports.WASI_SIGXFSZ]: "SIGXFSZ",
    [exports.WASI_SIGVTALRM]: "SIGVTALRM"
};

},{"./polyfills/bigint":"FkpS"}],"NPR0":[function(require,module,exports) {
"use strict";
/* eslint-disable no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
const bigint_1 = require("./polyfills/bigint");
const dataview_1 = require("./polyfills/dataview");
const buffer_1 = require("./polyfills/buffer");
// Import our default bindings depending on the environment
let defaultBindings;
/*ROLLUP_REPLACE_NODE
import nodeBindings from "./bindings/node";
defaultBindings = nodeBindings;
ROLLUP_REPLACE_NODE*/
/*ROLLUP_REPLACE_BROWSER
import browserBindings from "./bindings/browser";
defaultBindings = browserBindings;
ROLLUP_REPLACE_BROWSER*/
/*

This project is based from the Node implementation made by Gus Caplan
https://github.com/devsnek/node-wasi
However, JavaScript WASI is focused on:
 * Bringing WASI to the Browsers
 * Make easy to plug different filesystems
 * Provide a type-safe api using Typescript
 * Providing multiple output targets to support both browsers and node
 * The API is adapted to the Node-WASI API: https://github.com/nodejs/wasi/blob/wasi/lib/wasi.js

Copyright 2019 Gus Caplan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.

 */
const constants_1 = require("./constants");
const STDIN_DEFAULT_RIGHTS = constants_1.WASI_RIGHT_FD_DATASYNC |
    constants_1.WASI_RIGHT_FD_READ |
    constants_1.WASI_RIGHT_FD_SYNC |
    constants_1.WASI_RIGHT_FD_ADVISE |
    constants_1.WASI_RIGHT_FD_FILESTAT_GET |
    constants_1.WASI_RIGHT_POLL_FD_READWRITE;
const STDOUT_DEFAULT_RIGHTS = constants_1.WASI_RIGHT_FD_DATASYNC |
    constants_1.WASI_RIGHT_FD_WRITE |
    constants_1.WASI_RIGHT_FD_SYNC |
    constants_1.WASI_RIGHT_FD_ADVISE |
    constants_1.WASI_RIGHT_FD_FILESTAT_GET |
    constants_1.WASI_RIGHT_POLL_FD_READWRITE;
const STDERR_DEFAULT_RIGHTS = STDOUT_DEFAULT_RIGHTS;
const msToNs = (ms) => {
    const msInt = Math.trunc(ms);
    const decimal = bigint_1.BigIntPolyfill(Math.round((ms - msInt) * 1000000));
    const ns = bigint_1.BigIntPolyfill(msInt) * bigint_1.BigIntPolyfill(1000000);
    return ns + decimal;
};
const nsToMs = (ns) => {
    if (typeof ns === 'number') {
        ns = Math.trunc(ns);
    }
    const nsInt = bigint_1.BigIntPolyfill(ns);
    return Number(nsInt / bigint_1.BigIntPolyfill(1000000));
};
const wrap = (f) => (...args) => {
    try {
        return f(...args);
    }
    catch (e) {
        // If it's an error from the fs
        if (e && e.code && typeof e.code === "string") {
            return constants_1.ERROR_MAP[e.code] || constants_1.WASI_EINVAL;
        }
        // If it's a WASI error, we return it directly
        if (e instanceof WASIError) {
            return e.errno;
        }
        // Otherwise we let the error bubble up
        throw e;
    }
};
const stat = (wasi, fd) => {
    const entry = wasi.FD_MAP.get(fd);
    if (!entry) {
        throw new WASIError(constants_1.WASI_EBADF);
    }
    if (entry.filetype === undefined) {
        const stats = wasi.bindings.fs.fstatSync(entry.real);
        const { filetype, rightsBase, rightsInheriting } = translateFileAttributes(wasi, fd, stats);
        entry.filetype = filetype;
        if (!entry.rights) {
            entry.rights = {
                base: rightsBase,
                inheriting: rightsInheriting
            };
        }
    }
    return entry;
};
const translateFileAttributes = (wasi, fd, stats) => {
    switch (true) {
        case stats.isBlockDevice():
            return {
                filetype: constants_1.WASI_FILETYPE_BLOCK_DEVICE,
                rightsBase: constants_1.RIGHTS_BLOCK_DEVICE_BASE,
                rightsInheriting: constants_1.RIGHTS_BLOCK_DEVICE_INHERITING
            };
        case stats.isCharacterDevice(): {
            const filetype = constants_1.WASI_FILETYPE_CHARACTER_DEVICE;
            if (fd !== undefined && wasi.bindings.isTTY(fd)) {
                return {
                    filetype,
                    rightsBase: constants_1.RIGHTS_TTY_BASE,
                    rightsInheriting: constants_1.RIGHTS_TTY_INHERITING
                };
            }
            return {
                filetype,
                rightsBase: constants_1.RIGHTS_CHARACTER_DEVICE_BASE,
                rightsInheriting: constants_1.RIGHTS_CHARACTER_DEVICE_INHERITING
            };
        }
        case stats.isDirectory():
            return {
                filetype: constants_1.WASI_FILETYPE_DIRECTORY,
                rightsBase: constants_1.RIGHTS_DIRECTORY_BASE,
                rightsInheriting: constants_1.RIGHTS_DIRECTORY_INHERITING
            };
        case stats.isFIFO():
            return {
                filetype: constants_1.WASI_FILETYPE_SOCKET_STREAM,
                rightsBase: constants_1.RIGHTS_SOCKET_BASE,
                rightsInheriting: constants_1.RIGHTS_SOCKET_INHERITING
            };
        case stats.isFile():
            return {
                filetype: constants_1.WASI_FILETYPE_REGULAR_FILE,
                rightsBase: constants_1.RIGHTS_REGULAR_FILE_BASE,
                rightsInheriting: constants_1.RIGHTS_REGULAR_FILE_INHERITING
            };
        case stats.isSocket():
            return {
                filetype: constants_1.WASI_FILETYPE_SOCKET_STREAM,
                rightsBase: constants_1.RIGHTS_SOCKET_BASE,
                rightsInheriting: constants_1.RIGHTS_SOCKET_INHERITING
            };
        case stats.isSymbolicLink():
            return {
                filetype: constants_1.WASI_FILETYPE_SYMBOLIC_LINK,
                rightsBase: bigint_1.BigIntPolyfill(0),
                rightsInheriting: bigint_1.BigIntPolyfill(0)
            };
        default:
            return {
                filetype: constants_1.WASI_FILETYPE_UNKNOWN,
                rightsBase: bigint_1.BigIntPolyfill(0),
                rightsInheriting: bigint_1.BigIntPolyfill(0)
            };
    }
};
class WASIError extends Error {
    constructor(errno) {
        super();
        this.errno = errno;
        Object.setPrototypeOf(this, WASIError.prototype);
    }
}
exports.WASIError = WASIError;
class WASIExitError extends Error {
    constructor(code) {
        super(`WASI Exit error: ${code}`);
        this.code = code;
        Object.setPrototypeOf(this, WASIExitError.prototype);
    }
}
exports.WASIExitError = WASIExitError;
class WASIKillError extends Error {
    constructor(signal) {
        super(`WASI Kill signal: ${signal}`);
        this.signal = signal;
        Object.setPrototypeOf(this, WASIKillError.prototype);
    }
}
exports.WASIKillError = WASIKillError;
class WASIDefault {
    constructor(wasiConfig) {
        // Destructure our wasiConfig
        let preopens = {};
        if (wasiConfig && wasiConfig.preopens) {
            preopens = wasiConfig.preopens;
        }
        else if (wasiConfig && wasiConfig.preopenDirectories) {
            preopens = wasiConfig
                .preopenDirectories;
        }
        let env = {};
        if (wasiConfig && wasiConfig.env) {
            env = wasiConfig.env;
        }
        let args = [];
        if (wasiConfig && wasiConfig.args) {
            args = wasiConfig.args;
        }
        let bindings = defaultBindings;
        if (wasiConfig && wasiConfig.bindings) {
            bindings = wasiConfig.bindings;
        }
        // @ts-ignore
        this.memory = undefined;
        // @ts-ignore
        this.view = undefined;
        this.bindings = bindings;
        this.FD_MAP = new Map([
            [
                constants_1.WASI_STDIN_FILENO,
                {
                    real: 0,
                    filetype: constants_1.WASI_FILETYPE_CHARACTER_DEVICE,
                    // offset: BigInt(0),
                    rights: {
                        base: STDIN_DEFAULT_RIGHTS,
                        inheriting: bigint_1.BigIntPolyfill(0)
                    },
                    path: undefined
                }
            ],
            [
                constants_1.WASI_STDOUT_FILENO,
                {
                    real: 1,
                    filetype: constants_1.WASI_FILETYPE_CHARACTER_DEVICE,
                    // offset: BigInt(0),
                    rights: {
                        base: STDOUT_DEFAULT_RIGHTS,
                        inheriting: bigint_1.BigIntPolyfill(0)
                    },
                    path: undefined
                }
            ],
            [
                constants_1.WASI_STDERR_FILENO,
                {
                    real: 2,
                    filetype: constants_1.WASI_FILETYPE_CHARACTER_DEVICE,
                    // offset: BigInt(0),
                    rights: {
                        base: STDERR_DEFAULT_RIGHTS,
                        inheriting: bigint_1.BigIntPolyfill(0)
                    },
                    path: undefined
                }
            ]
        ]);
        let fs = this.bindings.fs;
        let path = this.bindings.path;
        for (const [k, v] of Object.entries(preopens)) {
            const real = fs.openSync(v, fs.constants.O_RDONLY);
            const newfd = [...this.FD_MAP.keys()].reverse()[0] + 1;
            this.FD_MAP.set(newfd, {
                real,
                filetype: constants_1.WASI_FILETYPE_DIRECTORY,
                // offset: BigInt(0),
                rights: {
                    base: constants_1.RIGHTS_DIRECTORY_BASE,
                    inheriting: constants_1.RIGHTS_DIRECTORY_INHERITING
                },
                fakePath: k,
                path: v
            });
        }
        const getiovs = (iovs, iovsLen) => {
            // iovs* -> [iov, iov, ...]
            // __wasi_ciovec_t {
            //   void* buf,
            //   size_t buf_len,
            // }
            this.refreshMemory();
            const buffers = Array.from({ length: iovsLen }, (_, i) => {
                const ptr = iovs + i * 8;
                const buf = this.view.getUint32(ptr, true);
                const bufLen = this.view.getUint32(ptr + 4, true);
                return new Uint8Array(this.memory.buffer, buf, bufLen);
            });
            return buffers;
        };
        const CHECK_FD = (fd, rights) => {
            const stats = stat(this, fd);
            // console.log(`CHECK_FD: stats.real: ${stats.real}, stats.path:`, stats.path);
            if (rights !== bigint_1.BigIntPolyfill(0) && (stats.rights.base & rights) === bigint_1.BigIntPolyfill(0)) {
                throw new WASIError(constants_1.WASI_EPERM);
            }
            return stats;
        };
        const CPUTIME_START = bindings.hrtime();
        const now = (clockId) => {
            switch (clockId) {
                case constants_1.WASI_CLOCK_MONOTONIC:
                    return bindings.hrtime();
                case constants_1.WASI_CLOCK_REALTIME:
                    return msToNs(Date.now());
                case constants_1.WASI_CLOCK_PROCESS_CPUTIME_ID:
                case constants_1.WASI_CLOCK_THREAD_CPUTIME_ID:
                    // return bindings.hrtime(CPUTIME_START)
                    return bindings.hrtime() - CPUTIME_START;
                default:
                    return null;
            }
        };
        this.wasiImport = {
            args_get: (argv, argvBuf) => {
                this.refreshMemory();
                let coffset = argv;
                let offset = argvBuf;
                args.forEach(a => {
                    this.view.setUint32(coffset, offset, true);
                    coffset += 4;
                    offset += buffer_1.default.from(this.memory.buffer).write(`${a}\0`, offset);
                });
                return constants_1.WASI_ESUCCESS;
            },
            args_sizes_get: (argc, argvBufSize) => {
                this.refreshMemory();
                this.view.setUint32(argc, args.length, true);
                const size = args.reduce((acc, a) => acc + buffer_1.default.byteLength(a) + 1, 0);
                this.view.setUint32(argvBufSize, size, true);
                return constants_1.WASI_ESUCCESS;
            },
            environ_get: (environ, environBuf) => {
                this.refreshMemory();
                let coffset = environ;
                let offset = environBuf;
                Object.entries(env).forEach(([key, value]) => {
                    this.view.setUint32(coffset, offset, true);
                    coffset += 4;
                    offset += buffer_1.default.from(this.memory.buffer).write(`${key}=${value}\0`, offset);
                });
                return constants_1.WASI_ESUCCESS;
            },
            environ_sizes_get: (environCount, environBufSize) => {
                this.refreshMemory();
                const envProcessed = Object.entries(env).map(([key, value]) => `${key}=${value}\0`);
                const size = envProcessed.reduce((acc, e) => acc + buffer_1.default.byteLength(e), 0);
                this.view.setUint32(environCount, envProcessed.length, true);
                this.view.setUint32(environBufSize, size, true);
                return constants_1.WASI_ESUCCESS;
            },
            clock_res_get: (clockId, resolution) => {
                let res;
                switch (clockId) {
                    case constants_1.WASI_CLOCK_MONOTONIC:
                    case constants_1.WASI_CLOCK_PROCESS_CPUTIME_ID:
                    case constants_1.WASI_CLOCK_THREAD_CPUTIME_ID: {
                        res = bigint_1.BigIntPolyfill(1);
                        break;
                    }
                    case constants_1.WASI_CLOCK_REALTIME: {
                        res = bigint_1.BigIntPolyfill(1000);
                        break;
                    }
                }
                this.view.setBigUint64(resolution, res);
                return constants_1.WASI_ESUCCESS;
            },
            clock_time_get: (clockId, precision, time) => {
                this.refreshMemory();
                const n = now(clockId);
                if (n === null) {
                    return constants_1.WASI_EINVAL;
                }
                this.view.setBigUint64(time, bigint_1.BigIntPolyfill(n), true);
                return constants_1.WASI_ESUCCESS;
            },
            fd_advise: wrap((fd, offset, len, advice) => {
                CHECK_FD(fd, constants_1.WASI_RIGHT_FD_ADVISE);
                return constants_1.WASI_ENOSYS;
            }),
            fd_allocate: wrap((fd, offset, len) => {
                CHECK_FD(fd, constants_1.WASI_RIGHT_FD_ALLOCATE);
                return constants_1.WASI_ENOSYS;
            }),
            fd_close: wrap((fd) => {
                const stats = CHECK_FD(fd, bigint_1.BigIntPolyfill(0));
                fs.closeSync(stats.real);
                this.FD_MAP.delete(fd);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_datasync: wrap((fd) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_DATASYNC);
                fs.fdatasyncSync(stats.real);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_fdstat_get: wrap((fd, bufPtr) => {
                const stats = CHECK_FD(fd, bigint_1.BigIntPolyfill(0));
                this.refreshMemory();
                this.view.setUint8(bufPtr, stats.filetype); // FILETYPE u8
                this.view.setUint16(bufPtr + 2, 0, true); // FDFLAG u16
                this.view.setUint16(bufPtr + 4, 0, true); // FDFLAG u16
                this.view.setBigUint64(bufPtr + 8, bigint_1.BigIntPolyfill(stats.rights.base), true); // u64
                this.view.setBigUint64(bufPtr + 8 + 8, bigint_1.BigIntPolyfill(stats.rights.inheriting), true); // u64
                return constants_1.WASI_ESUCCESS;
            }),
            fd_fdstat_set_flags: wrap((fd, flags) => {
                CHECK_FD(fd, constants_1.WASI_RIGHT_FD_FDSTAT_SET_FLAGS);
                return constants_1.WASI_ENOSYS;
            }),
            fd_fdstat_set_rights: wrap((fd, fsRightsBase, fsRightsInheriting) => {
                const stats = CHECK_FD(fd, bigint_1.BigIntPolyfill(0));
                const nrb = stats.rights.base | fsRightsBase;
                if (nrb > stats.rights.base) {
                    return constants_1.WASI_EPERM;
                }
                const nri = stats.rights.inheriting | fsRightsInheriting;
                if (nri > stats.rights.inheriting) {
                    return constants_1.WASI_EPERM;
                }
                stats.rights.base = fsRightsBase;
                stats.rights.inheriting = fsRightsInheriting;
                return constants_1.WASI_ESUCCESS;
            }),
            fd_filestat_get: wrap((fd, bufPtr) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_FILESTAT_GET);
                const rstats = fs.fstatSync(stats.real);
                this.refreshMemory();
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.dev), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.ino), true);
                bufPtr += 8;
                this.view.setUint8(bufPtr, stats.filetype);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.nlink), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.size), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, msToNs(rstats.atimeMs), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, msToNs(rstats.mtimeMs), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, msToNs(rstats.ctimeMs), true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_filestat_set_size: wrap((fd, stSize) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_FILESTAT_SET_SIZE);
                fs.ftruncateSync(stats.real, Number(stSize));
                return constants_1.WASI_ESUCCESS;
            }),
            fd_filestat_set_times: wrap((fd, stAtim, stMtim, fstflags) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_FILESTAT_SET_TIMES);
                const rstats = fs.fstatSync(stats.real);
                let atim = rstats.atime;
                let mtim = rstats.mtime;
                const n = nsToMs(now(constants_1.WASI_CLOCK_REALTIME));
                const atimflags = constants_1.WASI_FILESTAT_SET_ATIM | constants_1.WASI_FILESTAT_SET_ATIM_NOW;
                if ((fstflags & atimflags) === atimflags) {
                    return constants_1.WASI_EINVAL;
                }
                const mtimflags = constants_1.WASI_FILESTAT_SET_MTIM | constants_1.WASI_FILESTAT_SET_MTIM_NOW;
                if ((fstflags & mtimflags) === mtimflags) {
                    return constants_1.WASI_EINVAL;
                }
                if ((fstflags & constants_1.WASI_FILESTAT_SET_ATIM) === constants_1.WASI_FILESTAT_SET_ATIM) {
                    atim = nsToMs(stAtim);
                }
                else if ((fstflags & constants_1.WASI_FILESTAT_SET_ATIM_NOW) === constants_1.WASI_FILESTAT_SET_ATIM_NOW) {
                    atim = n;
                }
                if ((fstflags & constants_1.WASI_FILESTAT_SET_MTIM) === constants_1.WASI_FILESTAT_SET_MTIM) {
                    mtim = nsToMs(stMtim);
                }
                else if ((fstflags & constants_1.WASI_FILESTAT_SET_MTIM_NOW) === constants_1.WASI_FILESTAT_SET_MTIM_NOW) {
                    mtim = n;
                }
                fs.futimesSync(stats.real, new Date(atim), new Date(mtim));
                return constants_1.WASI_ESUCCESS;
            }),
            fd_prestat_get: wrap((fd, bufPtr) => {
                const stats = CHECK_FD(fd, bigint_1.BigIntPolyfill(0));
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                this.view.setUint8(bufPtr, constants_1.WASI_PREOPENTYPE_DIR);
                this.view.setUint32(bufPtr + 4, buffer_1.default.byteLength(stats.fakePath), true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_prestat_dir_name: wrap((fd, pathPtr, pathLen) => {
                const stats = CHECK_FD(fd, bigint_1.BigIntPolyfill(0));
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                buffer_1.default.from(this.memory.buffer).write(stats.fakePath, pathPtr, pathLen, "utf8");
                return constants_1.WASI_ESUCCESS;
            }),
            fd_pwrite: wrap((fd, iovs, iovsLen, offset, nwritten) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_WRITE | constants_1.WASI_RIGHT_FD_SEEK);
                let written = 0;
                getiovs(iovs, iovsLen).forEach(iov => {
                    let w = 0;
                    while (w < iov.byteLength) {
                        w += fs.writeSync(stats.real, iov, w, iov.byteLength - w, Number(offset) + written + w);
                    }
                    written += w;
                });
                this.view.setUint32(nwritten, written, true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_write: wrap((fd, iovs, iovsLen, nwritten) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_WRITE);
                let written = 0;
                getiovs(iovs, iovsLen).forEach(iov => {
                    let w = 0;
                    while (w < iov.byteLength) {
                        const i = fs.writeSync(stats.real, iov, w, iov.byteLength - w, stats.offset ? Number(stats.offset) : null);
                        if (stats.offset)
                            stats.offset += bigint_1.BigIntPolyfill(i);
                        w += i;
                    }
                    written += w;
                });
                this.view.setUint32(nwritten, written, true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_pread: wrap((fd, iovs, iovsLen, offset, nread) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_READ | constants_1.WASI_RIGHT_FD_SEEK);
                let read = 0;
                outer: for (const iov of getiovs(iovs, iovsLen)) {
                    let r = 0;
                    while (r < iov.byteLength) {
                        const length = iov.byteLength - r;
                        const rr = fs.readSync(stats.real, iov, r, iov.byteLength - r, Number(offset) + read + r);
                        r += rr;
                        read += rr;
                        // If we don't read anything, or we receive less than requested
                        if (rr === 0 || rr < length) {
                            break outer;
                        }
                    }
                    read += r;
                }
                ;
                this.view.setUint32(nread, read, true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_read: wrap((fd, iovs, iovsLen, nread) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_READ);
                const IS_STDIN = stats.real === 0;
                let read = 0;
                outer: for (const iov of getiovs(iovs, iovsLen)) {
                    let r = 0;
                    while (r < iov.byteLength) {
                        let length = iov.byteLength - r;
                        let position = IS_STDIN || stats.offset === undefined
                            ? null
                            : Number(stats.offset);
                        let rr = fs.readSync(stats.real, // fd
                        iov, // buffer
                        r, // offset
                        length, // length
                        position // position
                        );
                        if (!IS_STDIN) {
                            stats.offset =
                                (stats.offset ? stats.offset : bigint_1.BigIntPolyfill(0)) + bigint_1.BigIntPolyfill(rr);
                        }
                        r += rr;
                        read += rr;
                        // If we don't read anything, or we receive less than requested
                        if (rr === 0 || rr < length) {
                            break outer;
                        }
                    }
                }
                // We should not modify the offset of stdin
                this.view.setUint32(nread, read, true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_readdir: wrap((fd, bufPtr, bufLen, cookie, bufusedPtr) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_READDIR);
                this.refreshMemory();
                const entries = fs.readdirSync(stats.path, { withFileTypes: true });
                const startPtr = bufPtr;
                for (let i = Number(cookie); i < entries.length; i += 1) {
                    const entry = entries[i];
                    let nameLength = buffer_1.default.byteLength(entry.name);
                    if (bufPtr - startPtr > bufLen) {
                        break;
                    }
                    this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(i + 1), true);
                    bufPtr += 8;
                    if (bufPtr - startPtr > bufLen) {
                        break;
                    }
                    const rstats = fs.statSync(path.resolve(stats.path, entry.name));
                    this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.ino), true);
                    bufPtr += 8;
                    if (bufPtr - startPtr > bufLen) {
                        break;
                    }
                    this.view.setUint32(bufPtr, nameLength, true);
                    bufPtr += 4;
                    if (bufPtr - startPtr > bufLen) {
                        break;
                    }
                    let filetype;
                    switch (true) {
                        case rstats.isBlockDevice():
                            filetype = constants_1.WASI_FILETYPE_BLOCK_DEVICE;
                            break;
                        case rstats.isCharacterDevice():
                            filetype = constants_1.WASI_FILETYPE_CHARACTER_DEVICE;
                            break;
                        case rstats.isDirectory():
                            filetype = constants_1.WASI_FILETYPE_DIRECTORY;
                            break;
                        case rstats.isFIFO():
                            filetype = constants_1.WASI_FILETYPE_SOCKET_STREAM;
                            break;
                        case rstats.isFile():
                            filetype = constants_1.WASI_FILETYPE_REGULAR_FILE;
                            break;
                        case rstats.isSocket():
                            filetype = constants_1.WASI_FILETYPE_SOCKET_STREAM;
                            break;
                        case rstats.isSymbolicLink():
                            filetype = constants_1.WASI_FILETYPE_SYMBOLIC_LINK;
                            break;
                        default:
                            filetype = constants_1.WASI_FILETYPE_UNKNOWN;
                            break;
                    }
                    this.view.setUint8(bufPtr, filetype);
                    bufPtr += 1;
                    bufPtr += 3; // padding
                    if (bufPtr + nameLength >= startPtr + bufLen) {
                        // It doesn't fit in the buffer
                        break;
                    }
                    let memory_buffer = buffer_1.default.from(this.memory.buffer);
                    memory_buffer.write(entry.name, bufPtr);
                    bufPtr += nameLength;
                }
                const bufused = bufPtr - startPtr;
                this.view.setUint32(bufusedPtr, Math.min(bufused, bufLen), true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_renumber: wrap((from, to) => {
                CHECK_FD(from, bigint_1.BigIntPolyfill(0));
                CHECK_FD(to, bigint_1.BigIntPolyfill(0));
                fs.closeSync(this.FD_MAP.get(from).real);
                this.FD_MAP.set(from, this.FD_MAP.get(to));
                this.FD_MAP.delete(to);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_seek: wrap((fd, offset, whence, newOffsetPtr) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_SEEK);
                this.refreshMemory();
                switch (whence) {
                    case constants_1.WASI_WHENCE_CUR:
                        stats.offset =
                            (stats.offset ? stats.offset : bigint_1.BigIntPolyfill(0)) + bigint_1.BigIntPolyfill(offset);
                        break;
                    case constants_1.WASI_WHENCE_END:
                        const { size } = fs.fstatSync(stats.real);
                        stats.offset = bigint_1.BigIntPolyfill(size) + bigint_1.BigIntPolyfill(offset);
                        break;
                    case constants_1.WASI_WHENCE_SET:
                        stats.offset = bigint_1.BigIntPolyfill(offset);
                        break;
                }
                this.view.setBigUint64(newOffsetPtr, stats.offset, true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_tell: wrap((fd, offsetPtr) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_TELL);
                this.refreshMemory();
                if (!stats.offset) {
                    stats.offset = bigint_1.BigIntPolyfill(0);
                }
                this.view.setBigUint64(offsetPtr, stats.offset, true);
                return constants_1.WASI_ESUCCESS;
            }),
            fd_sync: wrap((fd) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_FD_SYNC);
                fs.fsyncSync(stats.real);
                return constants_1.WASI_ESUCCESS;
            }),
            path_create_directory: wrap((fd, pathPtr, pathLen) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_PATH_CREATE_DIRECTORY);
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const p = buffer_1.default.from(this.memory.buffer, pathPtr, pathLen).toString();
                fs.mkdirSync(path.resolve(stats.path, p));
                return constants_1.WASI_ESUCCESS;
            }),
            path_filestat_get: wrap((fd, flags, pathPtr, pathLen, bufPtr) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_PATH_FILESTAT_GET);
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const p = buffer_1.default.from(this.memory.buffer, pathPtr, pathLen).toString();
                const rstats = fs.statSync(path.resolve(stats.path, p));
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.dev), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.ino), true);
                bufPtr += 8;
                this.view.setUint8(bufPtr, translateFileAttributes(this, undefined, rstats).filetype);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.nlink), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, bigint_1.BigIntPolyfill(rstats.size), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, msToNs(rstats.atimeMs), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, msToNs(rstats.mtimeMs), true);
                bufPtr += 8;
                this.view.setBigUint64(bufPtr, msToNs(rstats.ctimeMs), true);
                return constants_1.WASI_ESUCCESS;
            }),
            path_filestat_set_times: wrap((fd, dirflags, pathPtr, pathLen, stAtim, stMtim, fstflags) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_PATH_FILESTAT_SET_TIMES);
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const rstats = fs.fstatSync(stats.real);
                let atim = rstats.atime;
                let mtim = rstats.mtime;
                const n = nsToMs(now(constants_1.WASI_CLOCK_REALTIME));
                const atimflags = constants_1.WASI_FILESTAT_SET_ATIM | constants_1.WASI_FILESTAT_SET_ATIM_NOW;
                if ((fstflags & atimflags) === atimflags) {
                    return constants_1.WASI_EINVAL;
                }
                const mtimflags = constants_1.WASI_FILESTAT_SET_MTIM | constants_1.WASI_FILESTAT_SET_MTIM_NOW;
                if ((fstflags & mtimflags) === mtimflags) {
                    return constants_1.WASI_EINVAL;
                }
                if ((fstflags & constants_1.WASI_FILESTAT_SET_ATIM) === constants_1.WASI_FILESTAT_SET_ATIM) {
                    atim = nsToMs(stAtim);
                }
                else if ((fstflags & constants_1.WASI_FILESTAT_SET_ATIM_NOW) === constants_1.WASI_FILESTAT_SET_ATIM_NOW) {
                    atim = n;
                }
                if ((fstflags & constants_1.WASI_FILESTAT_SET_MTIM) === constants_1.WASI_FILESTAT_SET_MTIM) {
                    mtim = nsToMs(stMtim);
                }
                else if ((fstflags & constants_1.WASI_FILESTAT_SET_MTIM_NOW) === constants_1.WASI_FILESTAT_SET_MTIM_NOW) {
                    mtim = n;
                }
                const p = buffer_1.default.from(this.memory.buffer, pathPtr, pathLen).toString();
                fs.utimesSync(path.resolve(stats.path, p), new Date(atim), new Date(mtim));
                return constants_1.WASI_ESUCCESS;
            }),
            path_link: wrap((oldFd, oldFlags, oldPath, oldPathLen, newFd, newPath, newPathLen) => {
                const ostats = CHECK_FD(oldFd, constants_1.WASI_RIGHT_PATH_LINK_SOURCE);
                const nstats = CHECK_FD(newFd, constants_1.WASI_RIGHT_PATH_LINK_TARGET);
                if (!ostats.path || !nstats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const op = buffer_1.default.from(this.memory.buffer, oldPath, oldPathLen).toString();
                const np = buffer_1.default.from(this.memory.buffer, newPath, newPathLen).toString();
                fs.linkSync(path.resolve(ostats.path, op), path.resolve(nstats.path, np));
                return constants_1.WASI_ESUCCESS;
            }),
            path_open: wrap((dirfd, dirflags, pathPtr, pathLen, oflags, fsRightsBase, fsRightsInheriting, fsFlags, fd) => {
                const stats = CHECK_FD(dirfd, constants_1.WASI_RIGHT_PATH_OPEN);
                fsRightsBase = bigint_1.BigIntPolyfill(fsRightsBase);
                fsRightsInheriting = bigint_1.BigIntPolyfill(fsRightsInheriting);
                const read = (fsRightsBase & (constants_1.WASI_RIGHT_FD_READ | constants_1.WASI_RIGHT_FD_READDIR)) !==
                    bigint_1.BigIntPolyfill(0);
                const write = (fsRightsBase &
                    (constants_1.WASI_RIGHT_FD_DATASYNC |
                        constants_1.WASI_RIGHT_FD_WRITE |
                        constants_1.WASI_RIGHT_FD_ALLOCATE |
                        constants_1.WASI_RIGHT_FD_FILESTAT_SET_SIZE)) !==
                    bigint_1.BigIntPolyfill(0);
                let noflags;
                if (write && read) {
                    noflags = fs.constants.O_RDWR;
                }
                else if (read) {
                    noflags = fs.constants.O_RDONLY;
                }
                else if (write) {
                    noflags = fs.constants.O_WRONLY;
                }
                // fsRightsBase is needed here but perhaps we should do it in neededInheriting
                let neededBase = fsRightsBase | constants_1.WASI_RIGHT_PATH_OPEN;
                let neededInheriting = fsRightsBase | fsRightsInheriting;
                if ((oflags & constants_1.WASI_O_CREAT) !== 0) {
                    noflags |= fs.constants.O_CREAT;
                    neededBase |= constants_1.WASI_RIGHT_PATH_CREATE_FILE;
                }
                if ((oflags & constants_1.WASI_O_DIRECTORY) !== 0) {
                    noflags |= fs.constants.O_DIRECTORY;
                }
                if ((oflags & constants_1.WASI_O_EXCL) !== 0) {
                    noflags |= fs.constants.O_EXCL;
                }
                if ((oflags & constants_1.WASI_O_TRUNC) !== 0) {
                    noflags |= fs.constants.O_TRUNC;
                    neededBase |= constants_1.WASI_RIGHT_PATH_FILESTAT_SET_SIZE;
                }
                // Convert file descriptor flags.
                if ((fsFlags & constants_1.WASI_FDFLAG_APPEND) !== 0) {
                    noflags |= fs.constants.O_APPEND;
                }
                if ((fsFlags & constants_1.WASI_FDFLAG_DSYNC) !== 0) {
                    if (fs.constants.O_DSYNC) {
                        noflags |= fs.constants.O_DSYNC;
                    }
                    else {
                        noflags |= fs.constants.O_SYNC;
                    }
                    neededInheriting |= constants_1.WASI_RIGHT_FD_DATASYNC;
                }
                if ((fsFlags & constants_1.WASI_FDFLAG_NONBLOCK) !== 0) {
                    noflags |= fs.constants.O_NONBLOCK;
                }
                if ((fsFlags & constants_1.WASI_FDFLAG_RSYNC) !== 0) {
                    if (fs.constants.O_RSYNC) {
                        noflags |= fs.constants.O_RSYNC;
                    }
                    else {
                        noflags |= fs.constants.O_SYNC;
                    }
                    neededInheriting |= constants_1.WASI_RIGHT_FD_SYNC;
                }
                if ((fsFlags & constants_1.WASI_FDFLAG_SYNC) !== 0) {
                    noflags |= fs.constants.O_SYNC;
                    neededInheriting |= constants_1.WASI_RIGHT_FD_SYNC;
                }
                if (write &&
                    (noflags & (fs.constants.O_APPEND | fs.constants.O_TRUNC)) === 0) {
                    neededInheriting |= constants_1.WASI_RIGHT_FD_SEEK;
                }
                this.refreshMemory();
                const p = buffer_1.default.from(this.memory.buffer, pathPtr, pathLen).toString();
                const fullUnresolved = path.resolve(stats.path, p);
                if (path.relative(stats.path, fullUnresolved).startsWith("..")) {
                    return constants_1.WASI_ENOTCAPABLE;
                }
                let full;
                try {
                    full = fs.realpathSync(fullUnresolved);
                    if (path.relative(stats.path, full).startsWith("..")) {
                        return constants_1.WASI_ENOTCAPABLE;
                    }
                }
                catch (e) {
                    if (e.code === "ENOENT") {
                        full = fullUnresolved;
                    }
                    else {
                        throw e;
                    }
                }
                /* check if the file is a directory (unless opening for write,
                 * in which case the file may not exist and should be created) */
                let isDirectory;
                try {
                    isDirectory = fs.statSync(full).isDirectory();
                }
                catch (e) { }
                let realfd;
                if (!write && isDirectory) {
                    realfd = fs.openSync(full, fs.constants.O_RDONLY);
                }
                else {
                    realfd = fs.openSync(full, noflags);
                }
                const newfd = [...this.FD_MAP.keys()].reverse()[0] + 1;
                this.FD_MAP.set(newfd, {
                    real: realfd,
                    filetype: undefined,
                    // offset: BigInt(0),
                    rights: {
                        base: neededBase,
                        inheriting: neededInheriting
                    },
                    path: full
                });
                stat(this, newfd);
                this.view.setUint32(fd, newfd, true);
                return constants_1.WASI_ESUCCESS;
            }),
            path_readlink: wrap((fd, pathPtr, pathLen, buf, bufLen, bufused) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_PATH_READLINK);
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const p = buffer_1.default.from(this.memory.buffer, pathPtr, pathLen).toString();
                const full = path.resolve(stats.path, p);
                const r = fs.readlinkSync(full);
                const used = buffer_1.default.from(this.memory.buffer).write(r, buf, bufLen);
                this.view.setUint32(bufused, used, true);
                return constants_1.WASI_ESUCCESS;
            }),
            path_remove_directory: wrap((fd, pathPtr, pathLen) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_PATH_REMOVE_DIRECTORY);
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const p = buffer_1.default.from(this.memory.buffer, pathPtr, pathLen).toString();
                fs.rmdirSync(path.resolve(stats.path, p));
                return constants_1.WASI_ESUCCESS;
            }),
            path_rename: wrap((oldFd, oldPath, oldPathLen, newFd, newPath, newPathLen) => {
                const ostats = CHECK_FD(oldFd, constants_1.WASI_RIGHT_PATH_RENAME_SOURCE);
                const nstats = CHECK_FD(newFd, constants_1.WASI_RIGHT_PATH_RENAME_TARGET);
                if (!ostats.path || !nstats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const op = buffer_1.default.from(this.memory.buffer, oldPath, oldPathLen).toString();
                const np = buffer_1.default.from(this.memory.buffer, newPath, newPathLen).toString();
                fs.renameSync(path.resolve(ostats.path, op), path.resolve(nstats.path, np));
                return constants_1.WASI_ESUCCESS;
            }),
            path_symlink: wrap((oldPath, oldPathLen, fd, newPath, newPathLen) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_PATH_SYMLINK);
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const op = buffer_1.default.from(this.memory.buffer, oldPath, oldPathLen).toString();
                const np = buffer_1.default.from(this.memory.buffer, newPath, newPathLen).toString();
                fs.symlinkSync(op, path.resolve(stats.path, np));
                return constants_1.WASI_ESUCCESS;
            }),
            path_unlink_file: wrap((fd, pathPtr, pathLen) => {
                const stats = CHECK_FD(fd, constants_1.WASI_RIGHT_PATH_UNLINK_FILE);
                if (!stats.path) {
                    return constants_1.WASI_EINVAL;
                }
                this.refreshMemory();
                const p = buffer_1.default.from(this.memory.buffer, pathPtr, pathLen).toString();
                fs.unlinkSync(path.resolve(stats.path, p));
                return constants_1.WASI_ESUCCESS;
            }),
            poll_oneoff: (sin, sout, nsubscriptions, nevents) => {
                let eventc = 0;
                let waitEnd = 0;
                this.refreshMemory();
                for (let i = 0; i < nsubscriptions; i += 1) {
                    const userdata = this.view.getBigUint64(sin, true);
                    sin += 8;
                    const type = this.view.getUint8(sin);
                    sin += 1;
                    switch (type) {
                        case constants_1.WASI_EVENTTYPE_CLOCK: {
                            sin += 7; // padding
                            const identifier = this.view.getBigUint64(sin, true);
                            sin += 8;
                            const clockid = this.view.getUint32(sin, true);
                            sin += 4;
                            sin += 4; // padding
                            const timestamp = this.view.getBigUint64(sin, true);
                            sin += 8;
                            const precision = this.view.getBigUint64(sin, true);
                            sin += 8;
                            const subclockflags = this.view.getUint16(sin, true);
                            sin += 2;
                            sin += 6; // padding
                            const absolute = subclockflags === 1;
                            let e = constants_1.WASI_ESUCCESS;
                            const n = bigint_1.BigIntPolyfill(now(clockid));
                            if (n === null) {
                                e = constants_1.WASI_EINVAL;
                            }
                            else {
                                const end = absolute ? timestamp : n + timestamp;
                                waitEnd =
                                    end > waitEnd ? end : waitEnd;
                            }
                            this.view.setBigUint64(sout, userdata, true);
                            sout += 8;
                            this.view.setUint16(sout, e, true); // error
                            sout += 2; // pad offset 2
                            this.view.setUint8(sout, constants_1.WASI_EVENTTYPE_CLOCK);
                            sout += 1; // pad offset 3
                            sout += 5; // padding to 8
                            eventc += 1;
                            break;
                        }
                        case constants_1.WASI_EVENTTYPE_FD_READ:
                        case constants_1.WASI_EVENTTYPE_FD_WRITE: {
                            sin += 3; // padding
                            const fd = this.view.getUint32(sin, true);
                            sin += 4;
                            this.view.setBigUint64(sout, userdata, true);
                            sout += 8;
                            this.view.setUint16(sout, constants_1.WASI_ENOSYS, true); // error
                            sout += 2; // pad offset 2
                            this.view.setUint8(sout, type);
                            sout += 1; // pad offset 3
                            sout += 5; // padding to 8
                            eventc += 1;
                            break;
                        }
                        default:
                            return constants_1.WASI_EINVAL;
                    }
                }
                this.view.setUint32(nevents, eventc, true);
                while (bindings.hrtime() < waitEnd) {
                    // nothing
                }
                return constants_1.WASI_ESUCCESS;
            },
            proc_exit: (rval) => {
                bindings.exit(rval);
                return constants_1.WASI_ESUCCESS;
            },
            proc_raise: (sig) => {
                if (!(sig in constants_1.SIGNAL_MAP)) {
                    return constants_1.WASI_EINVAL;
                }
                bindings.kill(constants_1.SIGNAL_MAP[sig]);
                return constants_1.WASI_ESUCCESS;
            },
            random_get: (bufPtr, bufLen) => {
                this.refreshMemory();
                bindings.randomFillSync(new Uint8Array(this.memory.buffer), bufPtr, bufLen);
                return constants_1.WASI_ESUCCESS;
            },
            sched_yield() {
                // Single threaded environment
                // This is a no-op in JS
                return constants_1.WASI_ESUCCESS;
            },
            sock_recv() {
                return constants_1.WASI_ENOSYS;
            },
            sock_send() {
                return constants_1.WASI_ENOSYS;
            },
            sock_shutdown() {
                return constants_1.WASI_ENOSYS;
            }
        };
        // Wrap each of the imports to show the calls in the console
        if (wasiConfig.traceSyscalls) {
            Object.keys(this.wasiImport).forEach((key) => {
                const prevImport = this.wasiImport[key];
                this.wasiImport[key] = function (...args) {
                    console.log(`WASI: wasiImport called: ${key} (${args})`);
                    try {
                        let result = prevImport(...args);
                        console.log(`WASI:  => ${result}`);
                        return result;
                    }
                    catch (e) {
                        console.log(`Catched error: ${e}`);
                        throw e;
                    }
                };
            });
        }
    }
    refreshMemory() {
        // @ts-ignore
        if (!this.view || this.view.buffer.byteLength === 0) {
            this.view = new dataview_1.DataViewPolyfill(this.memory.buffer);
        }
    }
    setMemory(memory) {
        this.memory = memory;
    }
    start(instance) {
        const exports = instance.exports;
        if (exports === null || typeof exports !== "object") {
            throw new Error(`instance.exports must be an Object. Received ${exports}.`);
        }
        const { memory } = exports;
        if (!(memory instanceof WebAssembly.Memory)) {
            throw new Error(`instance.exports.memory must be a WebAssembly.Memory. Recceived ${memory}.`);
        }
        this.setMemory(memory);
        if (exports._start) {
            exports._start();
        }
    }
    getImportNamespace(module) {
        let namespace = null;
        for (let imp of WebAssembly.Module.imports(module)) {
            // We only check for the functions
            if (imp.kind !== "function") {
                continue;
            }
            // We allow functions in other namespaces other than wasi
            if (!imp.module.startsWith("wasi_")) {
                continue;
            }
            if (!namespace) {
                namespace = imp.module;
            }
            else {
                if (namespace !== imp.module) {
                    throw new Error("Multiple namespaces detected.");
                }
            }
        }
        return namespace;
    }
    getImports(module) {
        let namespace = this.getImportNamespace(module);
        switch (namespace) {
            case "wasi_unstable":
                return {
                    wasi_unstable: this.wasiImport
                };
            case "wasi_snapshot_preview1":
                return {
                    wasi_snapshot_preview1: this.wasiImport
                };
            default:
                throw new Error("Can't detect a WASI namespace for the WebAssembly Module");
        }
    }
}
exports.default = WASIDefault;
WASIDefault.defaultBindings = defaultBindings;
// Also export it as a field in the export object
exports.WASI = WASIDefault;

},{"./polyfills/bigint":"FkpS","./polyfills/dataview":"tqnP","./polyfills/buffer":"kKJo","./constants":"cJdk"}],"b22p":[function(require,module,exports) {
"use strict";
// Simply polyfill for hrtime
// https://nodejs.org/api/process.html#process_process_hrtime_time
Object.defineProperty(exports, "__esModule", { value: true });
const NS_PER_SEC = 1e9;
const getBigIntHrtime = (nativeHrtime) => {
    return (time) => {
        const diff = nativeHrtime(time);
        // Return the time
        return (diff[0] * NS_PER_SEC + diff[1]);
    };
};
exports.default = getBigIntHrtime;

},{}],"yTJC":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const randomfill = require("randomfill");
const browser_hrtime_1 = require("../polyfills/browser-hrtime");
// @ts-ignore
const path = require("path-browserify");
const index_1 = require("../index");
const hrtime_bigint_1 = require("../polyfills/hrtime.bigint");
const bindings = {
    hrtime: hrtime_bigint_1.default(browser_hrtime_1.default),
    exit: (code) => {
        throw new index_1.WASIExitError(code);
    },
    kill: (signal) => {
        throw new index_1.WASIKillError(signal);
    },
    // @ts-ignore
    randomFillSync: randomfill.randomFillSync,
    isTTY: () => true,
    path: path,
    // Let the user attach the fs at runtime
    fs: null
};
exports.default = bindings;

},{"randomfill":"ODza","../polyfills/browser-hrtime":"RBKZ","path-browserify":"X8tR","../index":"NPR0","../polyfills/hrtime.bigint":"b22p"}],"Y7ZV":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.lowerI64Imports = void 0;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
function __awaiter(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}

var wasmTransformerWasmUrl = "data:application/wasm;base64,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ARC5ASACKAIUIQUgAigCEEEBRg1HIAUNRCACQRBqIAEQuQEgAigCFCEFIAIoAhBBAUYNRwJAIAUNAEEAIQhBvwEhBAxHC0HImsAAQRogASgCDCABKAIIakF/ahCcASEFDEcLIAJBEGogARC5ASACKAIUIQUgAigCEEEBRg1GAkAgBQ0AQQAhCEHAASEEDEYLQciawABBGiABKAIMIAEoAghqQX9qEJwBIQUMRgsgAkEQaiABEEYgAigCFCEFIAIoAhBBAUYNRSACQRBqIAEQRiACKAIUIQYgAigCEEEBRg0HQQAhCEHBASEEDEQLIAJBEGogARBGIAIoAhQhBSACKAIQQQFGDURBACEIQcIBIQQMQwsgAkEQaiABEEYgAigCFCEFIAIoAhBBAUYNQyACQRBqIAEQRiACKAIUIQYgAigCEEEBRg0FQQAhCEHDASEEDEILIAJBEGogARBGIAIoAhQhBSACKAIQQQFGDUJBACEIQccBIQQMQQsgAkEQaiABEEYgAigCFCEFIAIoAhBBAUYNQUEAIQhByAEhBAxACyACQRBqIAEQRiACKAIUIQUgAigCEEEBRg1AQQAhCEHEASEEDD8LIAynIQUMPwsgBiEFDD4LIAYhBQw9CyACQRBqIAEQWiACKQMQIgpCIIghCwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCAKp0EBRg0AAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgC6dB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IAAQHCAAQQU6AAAMPwsgAEHkAGotAABBEkYNCyABQQA2AiggASAAQegAaigCADYCLCABIABB7ABqKQIANwMgIAFB0ABqIAFBIGoQRiABKAJUIQIgASgCUEEBRg09IAAgAjYC3AEgACABKQMgNwK8ASAAQcQBaiABQShqKQMANwIACyAAEFQiAg08DD0LIAJBB0cNCiAALQABIgJBBUsNCiACDgYAEAAPDgsACyAAENMBCyAAEGAiAg05DDoLIAAQFiICRQ05DDgLQcinwABBDxC3AQALIABBADYCzAEgABAcIABBFToAAAw3C0GcrMAAQShB+KzAABD0AQALQYSpwABBDRC3AQALQcinwABBDxC3AQALQeSswABBBBC3AQALQa+rwABBBxC3AQALQZyswABBKEHErMAAEPQBAAsgAEHkAGotAABBEkYNASABQSBqIABB3ABqENABIAEoAiBBAUYNLiABQdAAakEIaiABQSBqQQRyIgJBCGopAgAiCjcDACABIAIpAgAiCzcDUCABQTRqKAIAIQIgAEEMNgJ0IAAgAjYC3AEgAEH4AGogCzcCACAAQYABaiAKNwIAIABBiAFqIAI2AgALIAAQZCICDS4MLwtBr6vAAEEHELcBAAsCQCAAQeQAai0AAEESRg0AIAFBIGogAEHcAGoQ0QEgASgCIEEBRg0sIAFB0ABqQRhqIAFBIGpBBHIiAkEYaigCACIDNgIAIAFB0ABqQRBqIAJBEGopAgAiCjcDACABQdAAakEIaiACQQhqKQIAIgs3AwAgASACKQIAIgw3A1AgAUHAAGooAgAhAiAAQQ02AnQgACACNgLcASAAQfgAaiAMNwIAIABBgAFqIAs3AgAgAEGIAWoiBCAKNwIAIABBkAFqIgggAzYCACAAQZQBaiACNgIAIAFBK2ogCCgAADYAACABIAQpAAA3ACMgABAcIABBJjoAACAAQQFqIgIgASkAIDcAACACQQdqIAFBIGpBB2opAAA3AAAMLgtBr6vAAEEHELcBAAsCQCAAQeQAai0AAEESRg0AIAFBIGogAEHcAGoQ0gEgASgCIEEBRg0rIAEpAiQhCiAAEBwgAEEEaiAKNwIAIABBKToAAAwtC0Gvq8AAQQcQtwEACyAAQeQAai0AAEESRg0BIAFBIGogAEHcAGoQvAEgASgCIEEBRg0pIAFB0ABqQQhqIAFBIGpBBHIiAkEIaikCACIKNwMAIAEgAikCACILNwNQIABBCzYCdCAAQfgAaiALNwIAIABBgAFqIAo3AgALIAAQBSICDSkMKgtBr6vAAEEHELcBAAtByqnAAEEfIABB2AFqKAIAIANqEJwBIQIMJwtBranAAEEdIAEoAlwgASgCWGpBf2oQnAEhAiABQRBqIQMLIAMoAgQiBEUNJSADKAIAIARBA3RBBBCrAgwlCyAAEBYiAkUNAQwkCyAAEBwgAEElOgAACyAAQQM6AOABDCMLQZyswABBKEGMrMAAEPQBAAsCQCAAQeQAai0AAEESRg0AIAFBIGogAEHcAGoQ6QEgASgCJCECIAEoAiBBAUYNISAAEBwgAEEEaiACNgIAIABBEjoAAAwiC0Gvq8AAQQcQtwEACwJAIABB5ABqLQAAQRJGDQAgAUEgaiAAQdwAahDoASABKAIkIQIgASgCIEEBRg0gIAAQHCAAQQRqIAI2AgAgAEEROgAADCELQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDlASABKAIgQQFGDR0gAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBAjYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAEDQiAg0dDB4LQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDmASABKAIgQQFGDRogAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBCTYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAEEEiAg0aDBsLQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDgASABKAIgQQFGDRcgAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBATYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAEEoiAg0XDBgLQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDnASABKAIgQQFGDRQgAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBAzYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAECIiAg0UDBULQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDhASABKAIgQQFGDREgAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBBDYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAEFUiAg0RDBILQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDjASABKAIgQQFGDQ4gAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBBjYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAEEkiAg0ODA8LQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDkASABKAIgQQFGDQsgAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBCDYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAEEAiAg0LDAwLQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDfASABKAIgQQFGDQggAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBBTYCdCAAIAI2AtwBIABB+ABqIAs3AgAgAEGAAWogCjcCACAAQYgBaiACNgIACyAAEGMiAg0IDAkLQa+rwABBBxC3AQALIABB5ABqLQAAQRJGDQEgAUEgaiAAQdwAahDiASABKAIgQQFGDQUgAUHQAGpBCGogAUEgakEEciICQQhqKQIAIgo3AwAgASACKQIAIgs3A1AgAUE0aigCACECIABBBzYCdCAAIAI2AtwBIABB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CyADELkCIAMoAghqQQs6AAAgAyADKAIIQQFqIgQ2AgggA0EAIAQQswEgAEEIaiADKAIINgIAIAAgAykDADcCACADQRBqJAALmAQCB38BfiMAQdAAayIBJAAgAEGkAWoiAi0AACEDIAJBAjoAAAJAAkACQCADQQJGDQAgAUEgaiAAQZwBaigCACAAQaABaigCACAAKAKYASADQQBHEG0CQCABKAIgQQFHDQAgASgCJCEDDAMLIAFBCGpBEGogAUEgakEEciIDQRBqKQIAIgg3AwAgAUEIakEIaiADQQhqKQIANwMAIAEgAykCADcDCCAIpyICQYCt4gRNDQFBvajAAEEdQQAQnAEhAwwCC0GwqMAAQQ0QtwEAC0EAIQMgASACQQAQmQEgAUEANgJIIAEgASgCBDYCRCABIAEoAgAiBDYCQAJAIAJFDQADQCABQSBqIAFBCGoQNgJAIAEoAiBBAUcNACABKAIkIQMgASgCRCICRQ0DIAEoAkAgAkEDdEEEEKsCDAMLIAEoAighBSABKAIkIQYCQCADIAEoAkRHDQAgAUHAAGogA0EBEMcBIAEoAkghAyABKAJAIQQLIAQgA0EDdGoiByAFNgIEIAcgBjYCACABIANBAWoiAzYCSCACQX9qIgINAAsLIAFBIGpBCGogAUHAAGpBCGooAgAiAzYCACABIAEpA0A3AyACQCADIAEoAiQiAkYNACABQSBqIAMQhwEgASgCJCECCyABKAIgIQMgABAcIABBCGogAjYCACAAQQRqIAM2AgAgAEEcOgAAQQAhAwsgAUHQAGokACADC+sDAgZ/AX4jAEEwayICJAAgAUEgaiIDLQAAIQQgA0ESOgAAIAJBDGpBAmoiAyABQSNqLQAAOgAAIAIgAUEhai8AADsBDAJAAkACQAJAIARBEkcNACACQRBqIAEQUSACKAIQQQFHDQEgACACKAIUNgIEIABBATYCAAwDCyABQRhqKQIAIQggAkEIakECaiADLQAAOgAAIAIgAi8BDDsBCCABQSRqKAAAIQMgAUEoaigAACEFDAELIAJBCmogAkEfai0AADoAACACIAIvAB07AQggAkEcai0AACEEIAJBIGooAgAhAyACQSRqKAIAIQUgAikCFCEICyACQQRqQQJqIAJBCGpBAmotAAA6AAAgAiACLwEIOwEEAkAgASADIAVqIgMQ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AiADEKgBAAtB+LvAACACIAMQqAEAC0GIvMAAIAIgAxCoAQALIAAgAUEDdkH4////AXFqIQALIAApAwBCASABQT9xrYaDQgBSC60CAgZ/AX4jAEEQayICJAAgAkEIaiABEGYgAiACKQMIIgg3AwACQAJAAkACQAJAAkAgCKdB/wFxIgNBAUsNACADDgIBAgELIAJBBHIQ7wELIAJBCGogARBGIAIoAgwhAyACKAIIQQFGDQEgASgCDCEEAkAgASgCBCIFIAEoAggiBiADaiIHTw0AQeSbwABBLyAEIAVqEJwBIQEgAEEBNgIAIAAgATYCBAwECyAHIAZJDQIgASAHNgIIIABBADYCACAAQRBqIAQgBmo2AgAgAEEMaiADNgIAIAAgCEIIiKdB/wFxNgIEIABBCGogASgCACAGajYCAAwDCyAAQQE2AgAgACAIQiCIPgIEDAILIABBATYCACAAIAM2AgQMAQsgBiAHEKoBAAsgAkEQaiQAC68CAgN/AX4jAEHQAGsiAyQAIAMgAjYCPAJAIAAoAgwgAk0NACADQRBqIANBPGpBAhCjAiADKQMQIQYgA0EIaiAAQQxqQQIQowIgA0EsakECNgIAIAMgBjcDQCADQgI3AhwgA0H8hcAANgIYIAMgAykDCDcDSCADIANBwABqNgIoIANBGGpBjIbAABDOAQALIAEoAgghBCADQRhqIAAgACgCECACaiIFIAUQnwEgA0HIAGoiBSABKAIINgIAIAMgASkCADcDQCADQTRqIANBwABqELkCIgE2AgAgA0EwaiADKAJENgIAIANBOGogASAFKAIAajYCACADIAE2AiwgA0EYahBSIANBGGoQmwEgA0EsahDNASAAIAI2AgwgACAEIAAoAhBqNgIQIANB0ABqJAALnAICAn8BfkEAIQYCQCABKAIEIgcgAmsgA08NACACIANqIgMgAkkhAgJAAkACQAJAIAVFDQAgAkUNASAAIAM2AgQgAEEIakEANgIADAMLIAJFDQEgACADNgIEIABBCGpBADYCAAwCCyAHQQF0IgIgAyACIANLGyEDCwJAIAOtQgx+IghCIIinRQ0AIABBCGpBADYCAAwBCwJAIAinIgJBf0oNACAAQQhqQQA2AgAMAQsCQAJAIAcNACACQQQQnQIhBQwBCyABKAIAIAdBDGxBBCACEJUCIQULAkAC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QQxGDQEgAUEUakEBNgIAIAFCAjcCBCABQfSkwAA2AgAgAUEPNgIcIAFB9KvAADYCGCABIAFBGGo2AhAgAUH8q8AAEM4BAAsgABASIQIMAQsgASAAQfgAahBnIAEoAgQhAiABKAIAQQFGDQAgABAcIABBBGogAjYCACAAQSg6AAAgACAAKALcAUF/ajYC3AFBACECCyABQSBqJAAgAguwAQICfwF+IwBBEGsiAiQAIAJBCGogARBGIAIoAgwhAwJAAkACQCACKAIIQQFGDQAgAkEIaiABEDIgAiACKQMIIgQ3AwACQAJAIASnQf8BcSIBQQFLDQAgAQ4CAQMBCyACQQRyEPEBCyAAIAM2AgQgAEEANgIAIABBCGogBEIIiKc6AAAMAgsgAEEBNgIAIAAgAzYCBAwBCyAAQQE2AgAgACAEQiCIPgIECyACQRBqJAALsQEBA38jAEEQayICJAAgAkEIaiABEJIBQQEhAyACKAIMIQQCQAJAIAIoAghBAUYNAAJAAkACQAJAAkAgBEECSw0AIAQOAwECAwELIABBBGpBrZvAAEERIAEoAgwgASgCCGpBf2oQnAE2AgBBASEDDAULQQAhAyAAQQA6AAEMBAsgAEEBOgABDAELIABBAjoAAQtBACEDDAELIABBBGogBDYCAAsgACADOgAAIAJBEGokAAuqAQEDfyMAQRBrIgIkACACQQhqIAEQRkEBIQMgAigCDCEEAkACQAJAIAIoAghBAUYNAAJAIARBAUYNACAAQb6bwABBFCABKAIMIAEoAghqQX9qEJwBNgIEQQEhAwwDCyACQQhqIAEQRkEBIQMgAigCDCEBIAIoAghBAUYNASAAIAE2AgRBACEDDAILIAAgBDYCBAwBCyAAIAE2AgQLIAAgAzYCACACQRBqJAALoAEBAX8jAEHAAGsiAyQAIANBMGogASACIAIQkgIgA0EIaiADQTBqELEBIANBIGogAygCCCADKAIMEKwCIANBMGpBCGoiAiADQSBqQQhqKAIANgIAIAMgAykDIDcDMCADQRBqIANBMGoQrAEgAiADQRBqQQhqKAIANgIAIAMgAykDEDcDMCADIANBMGoQsQEgACADKQMANwIAIANBwABqJAALoQEBBX8jAEEQayIDJAAgA0EIaiABEEZBASEEIAMoAgwhBQJAAkACQCADKAIIQQFGDQBBACEEQQAhBgJAIAJFDQAgA0EIaiABEEZBASEGIAMoAgwhByADKAIIQQFGDQILIAAgBTYCBCAAQQxqIAc2AgAgAEEIaiAGNgIADAILIAAgBTYCBAwBCyAAIAc2AgRBASEECyAAIAQ2AgAgA0EQaiQAC7kBAQF/AkAgAEGAgARJDQACQAJAIABBgIAISQ0AQQAhASAAQeKLdGpB4o0sSQ0BIABBn6h0akGfGEkNASAAQd7idGpBDkkNASAAQf7//wBxQZ7wCkYNASAAQamydWpBKUkNASAAQcuRdWpBC0kNASAAQZD8R2pBj/wLSw8LIABBycHAAEEjQY/CwABBpgFBtcPAAEGYAxAfIQELIAEPCyAAQZi8wABBKUHqvMAAQaUCQY+/wABBugIQHwuSAQEDfyMAQYABayICJAAgAC0AACEDQQAhAANAIAIgAGpB/wBqIANBD3EiBEEwciAEQdcAaiAEQQpJGzoAACAAQX9qIQAgA0EEdkEPcSIDDQALAkAgAEGAAWoiA0GBAUkNACADQYABEKoBAAsgAUEBQai5wABBAiACIABqQYABakEAIABrEA8hACACQYABaiQAIAALkQEBA38jAEGAAWsiAiQAIAAtAAAhA0EAIQADQCACIABqQf8AaiADQQ9xIgRBMHIgBEE3aiAEQQpJGzoAACAAQX9qIQAgA0EEdkEPcSIDDQALAkAgAEGAAWoiA0GBAUkNACADQYABEKoBAAsgAUEBQai5wABBAiACIABqQYABakEAIABrEA8hACACQYABaiQAIAALmQEBAX8jAEEgayIFJAAgBSADNgIUQQAhAyAFQQA2AhAgBSACNgIMIAUgATYCCCAFQRhqIAVBCGoQRiAFKAIcIQECQAJAIAUoAhhBAUYNACAAIAUpAwg3AgQgAEEYaiAEOgAAIABBFGogATYCACAAQQxqIAVBEGopAwA3AgAMAQsgACABNgIEQQEhAwsgACADNgIAIAVBIGokAAuOAQEDfyMAQRBrIgMkACAAIAAoAgggAiABa0EDdhDBASAAKAIIIQQCQCACIAFGDQAgACgCACAEQQxsaiEFA0AgAyABQQRqKAIAEF0gBUEIaiADQQhqKAIANgIAIAUgAykDADcCACAEQQFqIQQgBUEMaiEFIAIgAUEIaiIBRw0ACwsgACAENgIIIANBEGokAAuPAQEDfyMAQYABayICJAAgACgCACEDQQAhAANAIAIgAGpB/wBqIANBD3EiBEEwciAEQdcAaiAEQQpJGzoAACAAQX9qIQAgA0EEdiIDDQALAkAgAEGAAWoiA0GBAUkNACADQYABEKoBAAsgAUEBQai5wABBAiACIABqQYABakEAIABrEA8hACACQYABaiQAIAALjgEBA38jAEGAAWsiAiQAIAAoAgAhA0EAIQADQCACIABqQf8AaiADQQ9xIgRBMHIgBEE3aiAEQQpJGzoAACAAQX9qIQAgA0EEdiIDDQALAkAgAEGAAWoiA0GBAUkNACADQYABEKoBAAsgAUEBQai5wABBAiACIABqQYABakEAIABrEA8hACACQYABaiQAIAALmAEBAn8jAEEQayIDJAAgAyABEI4BIAMoAgQhBAJAAkAgAygCAEEBRg0AAkAgBCACSw0AIANBCGooAgAhASAAIAQ2AgQgAEEANgIAIABBCGogATYCAAwCC0HBmcAAQSkgASgCDCABKAIIakF/ahCcASEBIABBATYCACAAIAE2AgQMAQsgAEEBNgIAIAAgBDYCBAsgA0EQaiQAC5IBAQF/IwBBIGsiAyQAIANCADcDECADIAI2AgwgAyABNgIIIANBGGogA0EIahBQQQEhASADKAIcIQICQAJAIAMoAhhBAUYNACAAIAMpAwg3AgQgAEEkakESOgAAIABBFGogAjYCACAAQQxqIANBEGopAwA3AgBBACEBDAELIAAgAjYCBAsgACABNgIAIANBIGokAAuVAQEBfyMAQSBrIgQkACAEIAM2AhQgBEEANgIQIAQgAjYCDCAEIAE2AgggBEEYaiAEQQhqEEYgBCgCHCEBAkACQCAEKAIYQQFGDQACQCAEKAIQIgIgBCgCDEkNACAAIAE2AgRBACEDDAILQc+PwABBLCACIANqEJwBIQELIAAgATYCBEEBIQMLIAAgAzYCACAEQSBqJAALlQEBAX8jAEEgayIEJAAgBCADNgIUIARBADYCECAEIAI2AgwgBCABNgIIIARBGGogBEEIahBGIAQoAhwhAQJAAkAgBCgCGEEBRg0AAkAgBCgCECICIAQoAgxJDQAgACABNgIEQQAhAwwCC0H3kMAAQScgAiADahCcASEBCyAAIAE2AgRBASEDCyAAIAM2AgAgBEEgaiQAC48BAgN/An4jAEEQayID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IAEQMSEBIAJBIGokACABDwsgAkEgaiQAQQELcwECfwJAAkAgASgCCCICQQRqIgMgASgCBE0NACAAQc6VwABBDiABKAIMIAJqEJwBNgIEQQEhAQwBCwJAIAJBfEkNACACIAMQqgEACyABKAIAIAJqKAAAIQIgASADNgIIIAAgAjYCBEEAIQELIAAgATYCAAtsAQJ/IwBBIGsiASQAIAEgABABAkACQCABKAIAQQFGDQAgAUEIai8BACECA0ACQCACQf//A3FBBkcNAEEAIQIMAwsgASAAEAEgAS8BCCECIAEoAgBBAUcNAAsLIAEoAgQhAgsgAUEgaiQAIAILdQEBfwJAAkACQAJAIAAoAgQiAiABSQ0AAkAgAUUNACACIAFGDQQgACgCACACQQEgARCVAiICDQIgAUEBELQCAAsgABCOAiAAQQE2AgBBACEBDAILQcyMwABBJEGQjcAAENYBAAsgACACNgIACyAAIAE2AgQLC3UAIAAgATYCKCAAQQM6AOABIABBADYCdCAAQQE6AAAgAEEANgLcASAAQQA2AswBIABBADYCvAEgAEEANgK0ASAAQSxqIAI2AgAgAEGsAWpBADYCACAAQaQBakECOgAAIABB5ABqQRI6AAAgAEHQAGpBEzoAAAttAQF/IwBBMGsiAyQAIAMgAjYCBCADIAE2AgAgA0EcakECNgIAIANBLGpBAjYCACADQgI3AgwgA0GsssAANgIIIANBAjYCJCADIANBIGo2AhggAyADNgIoIAMgA0EEajYCICADQQhqIAAQ8gEAC3ABAX8jAEEwayICJAAgAiABNgIEIAIgADYCACACQRxqQQI2AgAgAkEsakECNgIAIAJCAjcCDCACQaC0wAA2AgggAkECNgIkIAIgAkEgajYCGCACIAJBBGo2AiggAiACNgIgIAJBCGpBsLTAABDyAQALcAEBfyMAQTBrIgIkACACIAE2AgQgAiAANgIAIAJBHGpBAjYCACACQSxqQQI2AgAgAkICNwIMIAJB5LTAADYCCCACQQI2AiQgAiACQSBqNgIYIAIgAkEEajYCKCACIAI2AiAgAkEIakH0tMAAEPIBAAtkAQJ/IwBBIGsiAiQAIAFBHGooAgAhAyABKAIYIQEgAkEIakEQaiAAQRBqKQIANwMAIAJBCGpBCGogAEEIaikCADcDACACIAApAgA3AwggASADIAJBCGoQCCEAIAJBIGokACAAC20BAX8jAEEgayICJAAgAkEIaiABEAICQCACKAIIQQFHDQAgAiACKQIMNwMYQZyGwABBKyACQRhqQciGwAAQlAEACyAAIAIpAgw3AgAgAEEIaiACQRRqKAIANgIAIAEQ1wIgARCPAiACQSBqJAALawEDfyAAIAEoAgwgASgCCGsQrgIgABC5AiECIAAoAgghAwJAIAEoAggiBCABKAIMRg0AA0AgASAEQQFqNgIIIAIgA2ogBC0AADoAACADQQFqIQMgASgCCCIEIAEoAgxHDQALCyAAIAM2AggLYwEBfyMAQSBrIgIkACACIAAoAgA2AgQgAkEIakEQaiABQRBqKQIANwMAIAJBCGpBCGogAUEIaikCADcDACACIAEpAgA3AwggAkEEakHQr8AAIAJBCGoQCCEBIAJBIGokACABC3MAAkACQEHE38AAEM8CIAJPDQACQAJAQcTfwAAQzwIgAk8NAEHE38AAIAIgAxAeIQIMAQtBxN/AACADEAQhAgsgAg0BQQAPC0HE38AAIAAgAxAODwsgAiAAIAMgASABIANLGxDXASECQcTfwAAgABANIAILZwECfyMAQSBrIgIkACACQQhqIAEQlwIgAigCCCEBIAIgAigCDCIDQQAQtAEgAkEANgIYIAIgAikDADcDECACQRBqIAEgAxCnAiAAQQhqIAIoAhg2AgAgACACKQMQNwIAIAJBIGokAAtmAQN/IwBBEGsiAiQAAkAgASgCBCIDIAEoAggiBEYNACABIAQQpgEgASgCBCEDCyABKAIAIQEgAiADNgIMIAIgATYCCCACQQhqELkCIQEgACACKAIMNgIEIAAgATYCACACQRBqJAALaAIBfwF+IwBBEGsiAyQAIANBCGogASACEAsCQAJAIAMpAwgiBEKAgICA8B+DQoCAgIAgUQ0AIAAgBDcCBEEBIQEMAQsgACABNgIEIABBCGogAjYCAEEAIQELIAAgATYCACADQRBqJAALYQECfwJAIAAoAggiAyABSQ0AAkAgAyAAKAIERw0AIABBARCuAgsgABC5AiABaiIEQQFqIAQgAyABaxCYARogBCACOgAAIAAgA0EBajYCCA8LQeCKwABBHkG0isAAENYBAAtdAAJAAkAgAUF/TA0AAkACQCABDQBBASECDAELAkAC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AUF0aiIBDQALCwtBAQF/AkACQCAAKAIEIgIgAUkNAEEAIQIgACgCCCABTQ0BQZWkwABBMiABEJwBDwtB8KPAAEElIAIQnAEhAgsgAgs7AQF/IwBBIGsiAyQAIANCBDcDECADQgE3AgQgAyABNgIcIAMgADYCGCADIANBGGo2AgAgAyACEPIBAAs2AQF/AkAgAkUNACAAIQMDQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAALOQEBfwJAIAAoAgQiAUUNACAAKAIAIAFBARCrAgsCQCAAQQxqKAIAIgFFDQAgACgCCCABQQEQqwILCy8AAkAgAEF8Sw0AAkAgAA0AQQQPCyAAIABBfUlBAnQQnQIiAEUNACAADwsQugIACzoBAX8CQCAAKAK0AQ0AQcCqwABBChC3AQALIABBuAFqKAIAIQEgABAcIABBBGogATYCACAAQSE6AAALNAEBfyAAIAAoAgggAiABayICEMkBIAAgACgCCCIDIAJqNgIIIAMgACgCAGogAiABIAIQWwsyACAAKAIAIQACQCABEKkCDQACQCABEKoCDQAgACABELECDwsgACABEGwPCyAAIAEQawsyACAAKAIAIQACQCABEKkCDQACQCABEKoCDQAgACABELACDwsgACABEHAPCyAAIAEQbws2AAJAIAEtAAhBBkYNAEGQncAAQSlBgJ3AABD0AQALIAAgASgCECABQRRqKAIAIAEoAgwQgwELNQACQCABLQAIQQhGDQBBzJ3AAEEtQbydwAAQ9AEACyAAIAEoAhAgAUEUaigCACABKAIMEH8LNgACQCABLQAIQQ9GDQBBzJ3AAEEtQfydwAAQ9AEACyAAIAEoAhAgAUEUaigCACABKAIMEIQBCzUAAkAgAS0ACEEMRg0AQZyewABBK0GMnsAAEPQBAAsgACABKAIQIAFBFGooAgAgASgCDBB4CzYAAkAgAS0ACEEHRg0AQdiewABBK0HInsAAEPQBAAsgACABKAIQIAFBFGooAgAgASgCDBCAAQs1AAJAIAEtAAhBC0YNAEGUn8AAQStBhJ/AABD0AQALIAAgASgCECABQRRqKAIAIAEoAgwQegs2AAJAIAEtAAhBCkYNAEHQn8AAQStBwJ/AABD0AQALIAAgASgCECABQRRqKAIAIAEoAgwQgQELNQACQCABLQAIQRBGDQBBjKDAAEEpQfyfwAAQ9AEACyAAIAEoAhAgAUEUaigCACABKAIMEHkLNgACQCABLQAIQQlGDQBByKDAAEEqQbigwAAQ9AEACyAAIAEoAhAgAUEUaigCACABKAIMEIIBCzUAAkAgAS0ACEEORg0AQYShwABBLEH0oMAAEPQBAAsgACABKAIQIAFBFGooAgAgASgCDBB7CzUAAkAgAS0ACEENRg0AQfSiwABBK0HkosAAEPQBAAsgACABKAIQIAFBFGooAgAgASgCDBB0CzUAAkAgAS0ACEERRg0AQbCjwABBMEGgo8AAEPQBAAsgACABKAIQIAFBFGooAgAgASgCDBBzCzEBAX8gACgCACIAIAIQiwEgACAAKAIIIgMgAmo2AgggAyAAKAIAaiABIAIQ1wEaQQALMgECfwJAIAAoAgAiASgCBCICRQ0AIAEoAgAgAkEBEKsCIAAoAgAhAQsgAUEQQQQQqwILMgECfwJAIAAoAgAiASgCBCICRQ0AIAEoAgAgAkEBEKsCIAAoAgAhAQsgAUEQQQQQqwILMgECfwJAIAAoAgAiASgCBCICRQ0AIAEoAgAgAkEBEKsCIAAoAgAhAQsgAUEQQQQQqwILMgECfwJAIAAoAgAiASgCBCICRQ0AIAEoAgAgAkEBEKsCIAAoAgAhAQsgAUEQQQQQqwILMgECfwJAIAAoAgAiASgCBCICRQ0AIAEoAgAgAkEBEKsCIAAoAgAhAQsgAUEQQQQQqwILMgECfwJAIAAoAgAiASgCBCICRQ0AIAEoAgAgAkEBEKsCIAAoAgAhAQsgAUEQQQQQqwILMgECfwJAIAAoAgAiASgCBCICRQ0AIAEoAgAgAkEBEKsCIAAoAgAhAQsgAUEQQQQQqwILMgEBfyMAQRBrIgIkACACIAE2AgwgAiAANgIIIAJB6LHAADYCBCACQQE2AgAgAhCiAQALLAEBfwJAIAJFDQAgACEDA0AgAyABOgAAIANBAWohAyACQX9qIgINAAsLIAALLAEBfyMAQRBrIgMkACADIAE2AgwgAyAANgIIIANBCGpB0I7AAEEAIAIQSwALJwEBfwJAIAAoAgQiAUUNACAAQQhqKAIAIgBFDQAgASAAQQEQqwILCyUBAX8jAEEQayICJAAgAiABNgIMIAIgADYCCCACQQhqEM4CGgALKAACQCAARQ0AIAAgAiADIAQgBSABKAIMEQwADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQoADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMERIADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMERMADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQoADwtB6N7AAEEwELMCAAsmAAJAIABFDQAgACACIAMgBCABKAIMEQkADwtB6N7AAEEwELMCAAskAAJAIABFDQAgACACIAMgASgCDBEHAA8LQejewABBMBCzAgALJAACQCAARQ0AIAAgAiADIAEoAgwRBwAPC0Ho3sAAQTAQswIACy4AAkBBACgCmN9ADQBBAEIANwKc30BBAEEENgKY30BBAEIANwKk30ALQZjfwAALJwACQEHE38AAEM8CIAFPDQBBxN/AACABIAAQHg8LQcTfwAAgABAECyYBAX8gACgCACIBKAIAIAEoAgQgACgCBCgCACAAKAIIKAIAEAYACyIAAkAgAEUNACAAIAIgASgCDBEGAA8LQejewABBMBCzAgALIAEBfwJAIAAoAgQiAUUNACAAKAIAIAFBAnRBBBCrAgsLIQACQCABKAIADQAQzQIACyAAQeSOwAA2AgQgACABNgIACx4AIAAgBDYCDCAAIAM2AgggACACNgIEIAAgATYCAAsdAQF/AkAgACgCBCIBRQ0AIAAoAgAgAUEBEKsCCwsdAQF/AkAgACgCBCIBRQ0AIAAoAgAgAUEBEKsCCwsdAQF/AkAgACgCBCIBRQ0AIAAoAgAgAUEBEKsCCwsaAQF/IAAgAUEAKAK030AiAkEQIAIbEQUAAAsXACAAIAI2AgggACADNgIEIAAgATYCAAsbAAJAIAANAEHUsMAAQStBtLDAABDWAQALIAALGwACQCAADQBB1LDAAEErQbSwwAAQ1gEACyAACxQBAX8gACABIAIgAxCvASEEIAQPCxYAIAAgASgCCDYCBCAAIAEoAgA2AgALFgAgACABKAIINgIEIAAgASgCADYCAAsWACAAIAEoAgg2AgQgACABKAIANgIACxYAIAAgASgCCDYCBCAAIAEoAgA2AgALEwACQCABRQ0AIAAgAUEEEKsCCwsQACABQXxqLQAAQQNxQQBHCxQAIAAoAgAgASAAKAIEKAIMEQYACxABAX8gACABEIgCIQIgAg8LEAEBfyAAIAEQzwEhAiACDwsQACAAIAI2AgQgACABNgIACxAAIAAgAjYCBCAAIAE2AgALEAAgACgCACAAKAIEIAEQBwsRACAAKAIAIAAoAgQgARC2AgsQACAAIAI2AgQgACABNgIACxAAIAAgAjYCBCAAIAE2AgALEAAgACACNgIEIAAgATYCAAsQACAAIAI2AgQgACABNgIACw4AIAAgASABIAJqENsBCxAAIAEgACgCACAAKAIEEAwLDQAgAC0AAEEQcUEEdgsNACAALQAAQSBxQQV2CwwAIAAgASACELcCDwsNACAAIAEgAiACEJICCw4AIAAgACgCCCABEMMBCw4AIAAgACgCCCABEMkBCxIAQbuxwABBEUHMscAAENYBAAsNACAANQIAQQEgARAsCw0AIAAxAABBASABECwLDQAgADUCAEEBIAEQLAsJACAAIAEQAAALCgAgACABEJECAAsMACAAIAEpAgA3AgALCgAgAiAAIAEQDAsLAEHE38AAIAAQDQsHACAAKAIACwcAIAAoAgALBgAQzQIACwYAEK8CAAsGABCvAgALBgAQrwIACwYAEK8CAAsGABCvAgALBgAQrwIACwYAEK8CAAsGABCvAgALBgAQrwIACwYAEK8CAAsHACAAKAIICwcAIAAoAgwLBwAgACgCCAsHACAAKAIMCwQAIAALDABC5K7ChZebpYgRCwwAQoP/iNuy5NTdCgsNAELWyK+kn9/x4cUACwMAAAsDAAALBABBCAsMAEKD/4jbsuTU3QoLAgALAgALAgALAgALAgALAgALAgALAgALAgALAgALAgALAgALAgALAgALC6PjgIAAAgBBgIDAAAuYX2NhbGxlZCBgT3B0aW9uOjp1bndyYXAoKWAgb24gYSBgTm9uZWAgdmFsdWUvcnVzdGMvMTliZDkzNDY3NjE3YTQ0N2MyMmVjMzJjYzFjZjE0ZDQwY2I4NGNjZi9zcmMvbGliY29yZS9tYWNyb3MvbW9kLnJzKwAQAEkAAAAPAAAAKAAAAGNhbGxlZCBgUmVzdWx0Ojp1bndyYXAoKWAgb24gYW4gYEVycmAgdmFsdWUAAwAAAAgAAAAEAAAABAAAAC9ydXN0Yy8xOWJkOTM0Njc2MTdhNDQ3YzIyZWMzMmNjMWNmMTRkNDBjYjg0Y2NmL3NyYy9saWJjb3JlL3NsaWNlL21vZC5yc8AAEABIAAAA9goAAAoAAADAABAASAAAAPwKAAAOAAAAYGFzc2VydGlvbiBmYWlsZWQ6IGAobGVmdCA9PSByaWdodClgCiAgbGVmdDogYGAsCiByaWdodDogYAAAKQEQAC0AAABWARAADAAAACgBEAABAAAAc3JjL3RyYW5zZm9ybWVyLnJzAAB8ARAAEgAAAEIAAAARAAAAfAEQABIAAABHAAAAFQAAAE9ubHkgb25lIHNlY3Rpb24gdHlwZSBpcyBhbGxvd2VkfAEQABIAAABgAAAAFQAAAE9ubHkgb25lIHNlY3Rpb24gaW1wb3J0IGlzIGFsbG93ZWQAAHwBEAASAAAAdQAAABUAAABPbmx5IG9uZSBzZWN0aW9uIGZ1bmN0aW9uIGlzIGFsbG93ZWR8ARAAEgAAAJAAAAAVAAAAT25seSBvbmUgc2VjdGlvbiBjb2RlIGlzIHN1cHBvcnRlZCBmb3Igbm93Q2FuJ3QgZ2V0IGxhdGVzdCBzZWN0aW9uVGhlIG5ldyBwb3NpdGlvbiAgc2hvdWxkIGJlIGFoZWFkIG9mIHByZXZpb3VzIHBvc2l0aW9uIAAAAIoCEAARAAAAmwIQACYAAAB8ARAAEgAAAOkBAAAJAAAAVGhlIHByb3ZpZGVkIHBvc2l0aW9uIAAA5AIQABYAAACbAhAAJgAAAHwBEAASAAAA/AEAAAkAAABjYWxsZWQgYFJlc3VsdDo6dW53cmFwKClgIG9uIGFuIGBFcnJgIHZhbHVlAAUAAAAIAAAABAAAAAQAAAAwLjAuMWNhbGxlZCBgUmVzdWx0Ojp1bndyYXAoKWAgb24gYW4gYEVycmAgdmFsdWUHAAAACAAAAAQAAAAEAAAAL3J1c3RjLzE5YmQ5MzQ2NzYxN2E0NDdjMjJlYzMyY2MxY2YxNGQ0MGNiODRjY2Yvc3JjL2xpYmNvcmUvc2xpY2UvbW9kLnJzmAMQAEgAAAD2CgAACgAAAJgDEABIAAAA/AoAAA4AAABgYXNzZXJ0aW9uIGZhaWxlZDogYChsZWZ0ID09IHJpZ2h0KWAKICBsZWZ0OiBgYCwKIHJpZ2h0OiBgYDogAAAAAQQQAC0AAAAuBBAADAAAADoEEAADAAAAUHJvdmlkZWQgZnVuY3Rpb24gaXMgbm90IGEgZnVuY3Rpb24AWAQQACMAAABzcmMvdXRpbHMucnOEBBAADAAAABYAAAAFAAAARGlkIG5vdCBwYXNzIGVub3VnaCBieXRlc0Vycm9yIGRlY29kaW5nIHRoZSB2YXJ1aW50MzIsIHRoZSBoaWdoIGJpdCB3YXMgaW5jb3JyZWN0bHkgc2V0YXNzZXJ0aW9uIGZhaWxlZDogc3RhcnQgPD0gZW5kPDo6Y29yZTo6bWFjcm9zOjpwYW5pYyBtYWNyb3M+ABUFEAAeAAAAAwAAAAoAAABhc3NlcnRpb24gZmFpbGVkOiBlbmQgPD0gbGVuYXNzZXJ0aW9uIGZhaWxlZDogaW5kZXggPD0gbGVuYXNzZXJ0aW9uIGZhaWxlZDogaW5kZXggPCBsZW5pbnRlcm5hbCBlcnJvcjogZW50ZXJlZCB1bnJlYWNoYWJsZSBjb2RlPDo6Y29yZTo6bWFjcm9zOjpwYW5pYyBtYWNyb3M+AAAAwwUQAB4AAAADAAAACgAAAC9ydXN0Yy8xOWJkOTM0Njc2MTdhNDQ3YzIyZWMzMmNjMWNmMTRkNDBjYjg0Y2NmL3NyYy9saWJjb3JlL3NsaWNlL21vZC5yc/QFEABIAAAA9goAAAoAAABUcmllZCB0byBzaHJpbmsgdG8gYSBsYXJnZXIgY2FwYWNpdHk8Ojpjb3JlOjptYWNyb3M6OnBhbmljIG1hY3Jvcz4AAHAGEAAeAAAAAwAAAAoAAABUcmllZCB0byBzaHJpbmsgdG8gYSBsYXJnZXIgY2FwYWNpdHk8Ojpjb3JlOjptYWNyb3M6OnBhbmljIG1hY3Jvcz4AAMQGEAAeAAAAAwAAAAoAAAAIAAAAaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZTw6OmNvcmU6Om1hY3Jvczo6cGFuaWMgbWFjcm9zPgAAIAcQAB4AAAADAAAACgAAAAkAAAAIAAAABAAAAAoAAAALAAAADAAAAAgAAAAEAAAADQAAAFVuZXhwZWN0ZWQgZGF0YSBhdCB0aGUgZW5kIG9mIHRoZSBzZWN0aW9uVW5leHBlY3RlZCBjb250ZW50IGluIHRoZSBzb3VyY2VNYXBwaW5nVVJMIHNlY3Rpb25VbmV4cGVjdGVkIGNvbnRlbnQgaW4gdGhlIGRhdGEgY291bnQgc2VjdGlvbkRhdGEgc2VnbWVudCBleHRlbmRzIHBhc3QgZW5kIG9mIHRoZSBkYXRhIHNlY3Rpb25pbnZhbGlkIGZsYWdzIGJ5dGUgaW4gZGF0YSBzZWdtZW50VW5leHBlY3RlZCBkYXRhIGF0IHRoZSBlbmQgb2YgdGhlIHNlY3Rpb25VbmV4cGVjdGVkIGNvbnRlbnQgaW4gdGhlIHN0YXJ0IHNlY3Rpb25pbnZhbGlkIHBhc3NpdmUgc2VnbWVudGludmFsaWQgZmxhZ3MgYnl0ZSBpbiBlbGVtZW50IHNlZ21lbnRvbmx5IHRoZSBmdW5jdGlvbiBleHRlcm5hbCB0eXBlIGlzIHN1cHBvcnRlZCBpbiBlbGVtIHNlZ21lbnRVbmV4cGVjdGVkIGRhdGEgYXQgdGhlIGVuZCBvZiB0aGUgc2VjdGlvbmFzc2VydGlvbiBmYWlsZWQ6IGAobGVmdCA9PSByaWdodClgCiAgbGVmdDogYGAsCiByaWdodDogYGA6IAA/CRAALQAAAGwJEAAMAAAAeAkQAAMAAABkZXN0aW5hdGlvbiBhbmQgc291cmNlIHNsaWNlcyBoYXZlIGRpZmZlcmVudCBsZW5ndGhzlAkQADQAAAAvcnVzdGMvMTliZDkzNDY3NjE3YTQ0N2MyMmVjMzJjYzFjZjE0ZDQwY2I4NGNjZi9zcmMvbGliY29yZS9tYWNyb3MvbW9kLnJzAAAA0AkQAEkAAAAXAAAADQAAANAJEABJAAAADwAAACgAAABVbmV4cGVjdGVkIGRhdGEgYXQgdGhlIGVuZCBvZiB0aGUgc2VjdGlvbi9Vc2Vycy9zeXJ1c2FrYmFyeS8uY2FyZ28vcmVnaXN0cnkvc3JjL2dpdGh1Yi5jb20tMWVjYzYyOTlkYjllYzgyMy93YXNtcGFyc2VyLTAuNTEuMy9zcmMvYmluYXJ5X3JlYWRlci5yc1VuZXhwZWN0ZWQgRU9GSW52YWxpZCB2YXJfdTFJbnZhbGlkIHZhcl9pN0ludmFsaWQgdmFyX3U3SW52YWxpZCB0eXBlSW52YWxpZCBleHRlcm5hbCBraW5kZnVuY3Rpb24gcGFyYW1zIHNpemUgaXMgb3V0IG9mIGJvdW5kZnVuY3Rpb24gcmV0dXJucyBzaXplIGlzIG91dCBvZiBib3VuZGludmFsaWQgdGFibGUgcmVzaXphYmxlIGxpbWl0cyBmbGFnc0ludmFsaWQgc2VjdGlvbiBjb2RlbmFtZXByb2R1Y2Vyc3NvdXJjZU1hcHBpbmdVUkxyZWxvYy5saW5raW5nYnJfdGFibGUgc2l6ZSBpcyBvdXQgb2YgYm91bmRJbnZhbGlkIHZhcl91OEludmFsaWQgdmFyX3UzMkludmFsaWQgdmFyXzMyc3RyaW5nIHNpemUgaW4gb3V0IG9mIGJvdW5kcwAAZQoQAGkAAAAqAgAACQAAAHNraXBfdG8gYWxsb3dlZCBvbmx5IGludG8gcmVnaW9uIHBhc3QgY3VycmVudCBwb3NpdGlvbkludmFsaWQgdmFyX2kzMkludmFsaWQgdmFyX3MzM0ludmFsaWQgdmFyX2k2NGludmFsaWQgVVRGLTggZW5jb2RpbmdhbGlnbm1lbnQgbXVzdCBub3QgYmUgbGFyZ2VyIHRoYW4gbmF0dXJhbFVua25vd24gMHhGRSBvcGNvZGVpbnZhbGlkIGZ1bmN0aW9uIHR5cGVVbmtub3duIG9wY29kZWJhZCBudW1iZXIgb2YgcmVzdWx0c1Vua25vd24gMHhmYyBvcGNvZGVyZXNlcnZlZCBieXRlIG11c3QgYmUgemVyb2ludmFsaWQgbGFuZSBpbmRleFVua25vd24gMHhmZCBvcGNvZGUAYXNtQmFkIG1hZ2ljIG51bWJlckJhZCB2ZXJzaW9uIG51bWJlckludmFsaWQgbmFtZSB0eXBlSW52YWxpZCBsaW5raW5nIHR5cGVJbnZhbGlkIHJlbG9jIHR5cGVOYW1lIGVudHJ5IGV4dGVuZHMgcGFzdCBlbmQgb2YgdGhlIGNvZGUgc2VjdGlvbi9Vc2Vycy9zeXJ1c2FrYmFyeS8uY2FyZ28vcmVnaXN0cnkvc3JjL2dpdGh1Yi5jb20tMWVjYzYyOTlkYjllYzgyMy93YXNtcGFyc2VyLTAuNTEuMy9zcmMvcmVhZGVycy9tb2R1bGUucnMAAAATDhAAagAAACwAAAASAAAASW52YWxpZCBzdGF0ZSBmb3IgZ2V0X3R5cGVfc2VjdGlvbl9yZWFkZXIAAAATDhAAagAAADgAAAASAAAASW52YWxpZCBzdGF0ZSBmb3IgZ2V0X2Z1bmN0aW9uX3NlY3Rpb25fcmVhZGVyAAAAEw4QAGoAAABEAAAAEgAAABMOEABqAAAAUAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfZXhwb3J0X3NlY3Rpb25fcmVhZGVyABMOEABqAAAAXAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfaW1wb3J0X3NlY3Rpb25fcmVhZGVyABMOEABqAAAAaAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfZ2xvYmFsX3NlY3Rpb25fcmVhZGVyABMOEABqAAAAdAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfbWVtb3J5X3NlY3Rpb25fcmVhZGVyABMOEABqAAAAgAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfZGF0YV9zZWN0aW9uX3JlYWRlcgAAABMOEABqAAAAjAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfdGFibGVfc2VjdGlvbl9yZWFkZXIAABMOEABqAAAAmAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfZWxlbWVudF9zZWN0aW9uX3JlYWRlchMOEABqAAAApQAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfbmFtZV9zZWN0aW9uX3JlYWRlcgAAABMOEABqAAAAvwAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfbGlua2luZ19zZWN0aW9uX3JlYWRlchMOEABqAAAAzAAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfcmVsb2Nfc2VjdGlvbl9yZWFkZXIAABMOEABqAAAA0wAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfc3RhcnRfc2VjdGlvbl9jb250ZW50ABMOEABqAAAA2gAAABIAAABJbnZhbGlkIHN0YXRlIGZvciBnZXRfZGF0YV9jb3VudF9zZWN0aW9uX2NvbnRlbnQTDhAAagAAAOcAAAASAAAAU2VjdGlvbiBib2R5IGV4dGVuZHMgcGFzdCBlbmQgb2YgZmlsZVNlY3Rpb24gaGVhZGVyIGlzIHRvbyBiaWcgdG8gZml0IGludG8gc2VjdGlvbiBib2R5bW9kdWxlIHJlYWRlcmJpbmFyeSByZWFkZXJleHBlY3RlZCAgcmVhZGVyAAAAYRIQAAkAAABqEhAABwAAAFR5cGVTZWN0aW9uUmVhZGVyAAAAhBIQABEAAAAvVXNlcnMvc3lydXNha2JhcnkvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9naXRodWIuY29tLTFlY2M2Mjk5ZGI5ZWM4MjMvd2FzbXBhcnNlci0wLjUxLjMvc3JjL3BhcnNlci5ycwAAoBIQAGIAAABgAQAAGgAAAEltcG9ydFNlY3Rpb25SZWFkZXIAFBMQABMAAACgEhAAYgAAAGoBAAAsAAAARnVuY3Rpb25TZWN0aW9uUmVhZGVyAAAAQBMQABUAAACgEhAAYgAAAHQBAAAZAAAATWVtb3J5U2VjdGlvblJlYWRlcgBwExAAEwAAAKASEABiAAAAfgEAABsAAABHbG9iYWxTZWN0aW9uUmVhZGVyAJwTEAATAAAAoBIQAGIAAACIAQAAKAAAAG9wZXJhdG9yIHJlYWRlckV4cG9ydFNlY3Rpb25SZWFkZXIAANcTEAATAAAAoBIQAGIAAACnAQAALQAAAEVsZW1lbnRTZWN0aW9uUmVhZGVyBBQQABQAAACgEhAAYgAAALEBAAArAAAAZWxlbWVudCBpdGVtc251bV9lbGVtZW50cyBpcyBvdXQgb2YgYm91bmRzQ29kZVNlY3Rpb25SZWFkZXIAWhQQABEAAACgEhAAYgAAAN0BAAAdAAAAZnVuY3Rpb24gYm9keWxvY2FsX2NvdW50IGlzIG91dCBvZiBib3VuZHNsb2NhbHNfdG90YWwgaXMgb3V0IG9mIGJvdW5kc0V4cGVjdGVkIGVuZCBvZiBmdW5jdGlvbiBtYXJrZXJUYWJsZVNlY3Rpb25SZWFkZXIA6RQQABIAAACgEhAAYgAAACUCAAAbAAAARGF0YVNlY3Rpb25SZWFkZXIAAAAUFRAAEQAAAKASEABiAAAALwIAACMAAABkYXRhIGVudHJ5bmFtZSBtYXAgc2l6ZSBpcyBvdXQgb2YgYm91bmROYW1lU2VjdGlvblJlYWRlcmcVEAARAAAAoBIQAGIAAABdAgAADAAAAGZ1bmN0aW9uIGNvdW50IGlzIG91dCBvZiBib3VuZHNzZWN0aW9uUmVsb2NTZWN0aW9uUmVhZGVythUQABIAAACgEhAAYgAAAJcCAAANAAAATGlua2luZ1NlY3Rpb25SZWFkZXLgFRAAFAAAAKASEABiAAAApgIAABUAAACgEhAAYgAAABEDAAASAAAAaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZaASEABiAAAAOgMAABIAAACgEhAAYgAAAFQDAAASAAAAZGF0YW1vZHVsZV9yZWFkZXIAAACgEhAAYgAAALADAAAdAAAAoBIQAGIAAACIAwAAJQAAAFBhcnNlciBpbiBlbmQgc3RhdGUAoBIQAGIAAACJAwAAJgAAAFBhcnNlciBpbiBlcnJvciBzdGF0ZVRyaWVkIHRvIHNocmluayB0byBhIGxhcmdlciBjYXBhY2l0eTw6OmNvcmU6Om1hY3Jvczo6cGFuaWMgbWFjcm9zPgD1FhAAHgAAAAMAAAAKAAAAaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZVVuZXhwZWN0ZWQgZGF0YSBhdCB0aGUgZW5kIG9mIHRoZSBzZWN0aW9uRnVuY3Rpb24gYm9keSBleHRlbmRzIHBhc3QgZW5kIG9mIHRoZSBjb2RlIHNlY3Rpb25VbmV4cGVjdGVkIGRhdGEgYXQgdGhlIGVuZCBvZiB0aGUgc2VjdGlvbhEAAAAEAAAABAAAABIAAAATAAAAFAAAAC9ydXN0Yy8xOWJkOTM0Njc2MTdhNDQ3YzIyZWMzMmNjMWNmMTRkNDBjYjg0Y2NmL3NyYy9saWJjb3JlL21hY3Jvcy9tb2QucnMAAADoFxAA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AAAAAP//////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/////7+2AAAAAAAAAAAA/wcAAAAAAPj//wAAAQAAAAAAAAAAAAAAwJ+fPQAAAAACAAAA////BwAAAAAAAAAAAADA/wEAAAAAAAD4DyBQIxAASgAAAKAlEAAAAgAAoCcQADoAAAAAAQIDBAUGBwgJCAoLDA0ODxAREhMUAhUWFxgZGhscHR4fIAICAgICAgICAgIhAgICAgICAgICAgICAgIiIyQlJgInAigCAgIpKisCLC0uLzACAjECAgIyAgICAgICAgIzAgI0AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI1AjYCNwICAgICAgICOAI5AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI6OzwCAgICPQICPj9AQUJDREVGAgICRwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJIAgICAgICAgICAgJJAgICAgI7AgABAgICAgMCAgICBAIFBgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJjbG9zdXJlIGludm9rZWQgcmVjdXJzaXZlbHkgb3IgZGVzdHJveWVkIGFscmVhZHkAQZjfwAAL+AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyLGBgAAEbmFtZQG9sYGAAN8CABBfX3diaW5kZ2VuX3Rocm93AUl3YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfb3BlcmF0b3I6Omg0YWFmNDM5N2Y5ZTk4ZTMzAkN3YXNtX3RyYW5zZm9ybWVyOjp0cmFuc2Zvcm1lcjo6bG93ZXJfaTY0X2ltcG9ydHM6Omg0MmJmNmY2YjgxNzBlMjViA1g8d2FzbXBhcnNlcjo6cGFyc2VyOjpQYXJzZXIgYXMgd2FzbXBhcnNlcjo6cGFyc2VyOjpXYXNtRGVjb2Rlcj46OnJlYWQ6Omg1OWM4YzA1OGRmMzkxNWU1BDdkbG1hbGxvYzo6ZGxtYWxsb2M6OkRsbWFsbG9jOjptYWxsb2M6OmhlMjNkNjZjNjYyNWQyYmZhBT53YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF9uYW1lX2VudHJ5OjpoMmE3MGIxNWRjNTJlNGQ0NgYuY29yZTo6c3RyOjpzbGljZV9lcnJvcl9mYWlsOjpoZTY5NWViNGY1ZDNmYzFlYQcxPHN0ciBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoMmQ1NzAxY2FlZjBlNDIwMggjY29yZTo6Zm10Ojp3cml0ZTo6aDA0OGYwOGExMDk5NmQzYzQJSndhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF9mdW5jX3R5cGU6OmgxYmE4NDk5YTY3NDQ1ZTY4ClN3YXNtcGFyc2VyOjpyZWFkZXJzOjplbGVtZW50X3NlY3Rpb246OkVsZW1lbnRTZWN0aW9uUmVhZGVyOjpyZWFkOjpoNjY5MWE0MWM2OTljMTJkNgsxY29yZTo6c3RyOjpydW5fdXRmOF92YWxpZGF0aW9uOjpoNGY1NTliZWFlYzdlZDdmYgwsY29yZTo6Zm10OjpGb3JtYXR0ZXI6OnBhZDo6aDdhNzkzM2E1ZDg4NGUyZWUNNWRsbWFsbG9jOjpkbG1hbGxvYzo6RGxtYWxsb2M6OmZyZWU6OmgzZTJlZThlOTIyNWMyOGQ0DjhkbG1hbGxvYzo6ZGxtYWxsb2M6OkRsbWFsbG9jOjpyZWFsbG9jOjpoYzk0NGNkNjA4OWUwOTU4Zg81Y29yZTo6Zm10OjpGb3JtYXR0ZXI6OnBhZF9pbnRlZ3JhbDo6aDU3ZTAzMDUyODljYzAzMmYQUXdhc21wYXJzZXI6OnJlYWRlcnM6OmltcG9ydF9zZWN0aW9uOjpJbXBvcnRTZWN0aW9uUmVhZGVyOjpyZWFkOjpoNTMxYTIyM2RjYzI4NjNkMRE+ZGxtYWxsb2M6OmRsbWFsbG9jOjpEbG1hbGxvYzo6ZGlzcG9zZV9jaHVuazo6aDI3ZWEwYjk1NTZlODRiMjQSQHdhc21wYXJzZXI6OnBhcnNlcjo6UGFyc2VyOjpjaGVja19zZWN0aW9uX2VuZDo6aGZkYWViYWY2ZDRkYjgyZDMTO3dhc21fdHJhbnNmb3JtZXI6OnV0aWxzOjpsb3dlcl9mdW5jX2JvZHk6Omg2MjBlZTRlNWMwOGMwMzU5FE13YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfc2VjdGlvbl9jb2RlOjpoMzM2OTY2YWQzOGFjYjExZBVId2FzbV90cmFuc2Zvcm1lcjo6dXRpbHM6OmdlbmVyYXRlX3RyYW1wb2xpbmVfZnVuY3Rpb246Omg2NmUwZmMwODc2YTY1NWU3FkZ3YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF9lbGVtZW50X2VudHJ5X2JvZHk6OmhkNTYwMjliNDlkOGM4Mzc0F0J3YXNtcGFyc2VyOjpyZWFkZXJzOjptb2R1bGU6Ok1vZHVsZVJlYWRlcjo6cmVhZDo6aGQzNDQxZDBhYTdiYjJhY2UYMjxjaGFyIGFzIGNvcmU6OmZtdDo6RGVidWc+OjpmbXQ6Omg0M2FiNGU4OTFkN2IwZWU4GT93YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6Y3VycmVudF9wb3NpdGlvbjo6aDRmY2IxMzMwOWI1N2YyMWIaTXdhc21wYXJzZXI6OnJlYWRlcnM6OmRhdGFfc2VjdGlvbjo6RGF0YVNlY3Rpb25SZWFkZXI6OnJlYWQ6OmhjMTlkMzEyNWYxMjRhYmE2G093YXNtX3RyYW5zZm9ybWVyOjp0cmFuc2Zvcm1lcjo6UmVwbGFjZW1lbnRCdWY6OmdldF9zaXplX2RpZmY6Omg1Yjg1YjkyYTdhNTg2NDgyHDBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDA5M2U1MzRlYzg1MjQyNDgdOndhc21wYXJzZXI6OnBhcnNlcjo6UGFyc2VyOjpyZWFkX25hbWluZzo6aGQ1NTI3MWQzYWI3YTU4ZTQeOWRsbWFsbG9jOjpkbG1hbGxvYzo6RGxtYWxsb2M6Om1lbWFsaWduOjpoMTZiOTI4ZGNlNThmN2RlNh8yY29yZTo6dW5pY29kZTo6cHJpbnRhYmxlOjpjaGVjazo6aDA0NzMzODY0YWVhMjhiMTMgQHdhc21wYXJzZXI6OnBhcnNlcjo6UGFyc2VyOjpyZWFkX25leHRfc2VjdGlvbjo6aDhkYjQ1ZWRlYzM2YTZhMzUhSHdhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF92YXJfczMzOjpoMGQ2NDYwOTQzNzFjNWY2YSJBd2FzbXBhcnNlcjo6cGFyc2VyOjpQYXJzZXI6OnJlYWRfZWxlbWVudF9lbnRyeTo6aDUzOTk4Njg3NDRhNmEyYzMjQGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZV9pbnRlcm5hbDo6aDJjYWFjYjgzNDZlYWE1YWYkQGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZV9pbnRlcm5hbDo6aGViM2ZiNjIyNmE4MWYzZjUlSHdhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF92YXJfaTMyOjpoZmU1MWIzOTY4NjE4Nzc2YyYwY29yZTo6cHRyOjpyZWFsX2Ryb3BfaW5fcGxhY2U6OmgyYzYzN2U3ZTk5MjM4NGMyJ0BhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfaW50ZXJuYWw6OmgxNjM4YzFmMzM2NTdhNDA3KEBhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfaW50ZXJuYWw6Omg0ODBlNjE1MjRkZjE1NTcxKUBhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfaW50ZXJuYWw6Omg2N2Y2N2RkMzk2ZDVjNDUxKkBhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfaW50ZXJuYWw6Omg5YjMxODQ1YzRiY2YzNGZiK113YXNtX3RyYW5zZm9ybWVyOjp0cmFuc2Zvcm1lcjo6UmVwbGFjZW1lbnRCdWY6OnJlcGxhY2VfdmFydWludF93aXRoX29mZnNldDo6aDFhYjBmYjI5NGY3NWM5ZmIsL2NvcmU6OmZtdDo6bnVtOjppbXA6OmZtdF91NjQ6Omg4MzhlZTFiNjAyYWE3M2NmLUNkbG1hbGxvYzo6ZGxtYWxsb2M6OkRsbWFsbG9jOjppbnNlcnRfbGFyZ2VfY2h1bms6OmhmOTBiYzU0N2M1MjlkNzQ5Ljs8Jm11dCBXIGFzIGNvcmU6OmZtdDo6V3JpdGU+Ojp3cml0ZV9jaGFyOjpoZjRiMDJmZTdjZTNjYjUyMi9Pd2FzbXBhcnNlcjo6cmVhZGVyczo6cmVsb2Nfc2VjdGlvbjo6UmVsb2NTZWN0aW9uUmVhZGVyOjpyZWFkOjpoYjJmMzA3N2FiZTRmMjZkYTBAd2FzbXBhcnNlcjo6cGFyc2VyOjpQYXJzZXI6OnJlYWRfaW1wb3J0X2VudHJ5OjpoOTc5NzhjZWIzZWE0ZmZmNjFJY29yZTo6Zm10OjpudW06OjxpbXBsIGNvcmU6OmZtdDo6RGVidWcgZm9yIHVzaXplPjo6Zm10OjpoOWU4ZWVkZWVmYjgxOWFlNzJFd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpyZWFkX3R5cGU6OmhjOTEzNWE0NWJlNTI3MTQ5M0t3YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfdGFibGVfdHlwZTo6aGFhN2NiNTg2MTZhNDM5NWQ0Pndhc21wYXJzZXI6OnBhcnNlcjo6UGFyc2VyOjpyZWFkX2RhdGFfZW50cnk6OmgyNTcxYThjMWI4YTFjZGFiNWg8c3RkOjpwYW5pY2tpbmc6OmJlZ2luX3BhbmljX2hhbmRsZXI6OlBhbmljUGF5bG9hZCBhcyBjb3JlOjpwYW5pYzo6Qm94TWVVcD46OnRha2VfYm94OjpoZDJlODMxMTdhZTA5NzU3ZjZRd2FzbXBhcnNlcjo6cmVhZGVyczo6ZWxlbWVudF9zZWN0aW9uOjpFbGVtZW50SXRlbXNSZWFkZXI6OnJlYWQ6OmhmMTlmYmI5ZTk3NWNmMjNlN0NkbG1hbGxvYzo6ZGxtYWxsb2M6OkRsbWFsbG9jOjp1bmxpbmtfbGFyZ2VfY2h1bms6Omg1MGQ1ZTg4YmMwMmQ2MTEzOD53YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF90eXBlX2VudHJ5OjpoMTI3YjNjNjdhZGUwNjQzZjk9Y29yZTo6dW5pY29kZTo6Ym9vbF90cmllOjpCb29sVHJpZTo6bG9va3VwOjpoMmNlZjYwYTE0YWIxZmNkZDpNd2FzbXBhcnNlcjo6cmVhZGVyczo6bmFtZV9zZWN0aW9uOjpOYW1lU2VjdGlvblJlYWRlcjo6cmVhZDo6aDEyMWViMWJiNGFmYTQzMzY7VHdhc21fdHJhbnNmb3JtZXI6OnRyYW5zZm9ybWVyOjpSZXBsYWNlbWVudEJ1Zjo6aW5zZXJ0X2luX3Bvc2l0aW9uOjpoZmFkNTIzOTM4YjEwNTY4YjxAYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlX2ludGVybmFsOjpoNzFhM2ViZDhmNzdkMDU2ZD1AYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlX2ludGVybmFsOjpoZTBjMTUzODRjMWEwZGQ0OT5Od2FzbXBhcnNlcjo6cmVhZGVyczo6cmVsb2Nfc2VjdGlvbjo6UmVsb2NTZWN0aW9uUmVhZGVyOjpuZXc6OmgwMWIwYTc0MzI4ZjIwZTUwP0BhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfaW50ZXJuYWw6Omg2NmZiNjMxZWFmNjM4YjBiQEB3YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF9tZW1vcnlfZW50cnk6Omg2MmI3M2ViMDYxY2RjYWQ4QT93YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF90YWJsZV9lbnRyeTo6aDEzOGM0NDJkYzRkOThlOTdCQGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZV9pbnRlcm5hbDo6aDFkMTZmN2JkNDllODg4NDFDQGFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZV9pbnRlcm5hbDo6aDI2MDQ1YTdhY2U5ZDEzYzREQXdhc21fdHJhbnNmb3JtZXI6OnV0aWxzOjpyZWFkX2J5dGVzX2FzX3ZhcnVuaXQ6OmhiZTUzOTcxODEwY2EyZTQyRU93YXNtcGFyc2VyOjpyZWFkZXJzOjpuYW1lX3NlY3Rpb246OkZ1bmN0aW9uTG9jYWxSZWFkZXI6OnJlYWQ6Omg2MzY3N2RhMDFmMzdlYzY1Rkh3YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfdmFyX3UzMjo6aDFiNWVkMTIyM2UzYzcxODhHSHdhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF92YXJfaTY0OjpoZDhlN2ZiMDc0ZTdhNGM4YUhRd2FzbXBhcnNlcjo6cmVhZGVyczo6Z2xvYmFsX3NlY3Rpb246Okdsb2JhbFNlY3Rpb25SZWFkZXI6OnJlYWQ6OmhmODkyMjNlMzU5MjU1NWMwSUB3YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF9nbG9iYWxfZW50cnk6Omg5MmM0Zjg0YzkyZjBjNWZmSkF3YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF9mdW5jdGlvbl9ib2R5OjpoMmZhOWEzM2FhNDM1NDdkN0s3c3RkOjpwYW5pY2tpbmc6OnJ1c3RfcGFuaWNfd2l0aF9ob29rOjpoZjNmYmRkM2JkYWVhZmY4NkxRd2FzbXBhcnNlcjo6cmVhZGVyczo6ZXhwb3J0X3NlY3Rpb246OkV4cG9ydFNlY3Rpb25SZWFkZXI6OnJlYWQ6OmhmNTg2ZGM2NjE0NGRlM2ExTUx3YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfbWVtb3J5X3R5cGU6Omg3MTQ3YWQxMThjNGNlZmVjTkBhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfaW50ZXJuYWw6OmgyNmJkZDM0NzMwZWNkZTFmT0BhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmVfaW50ZXJuYWw6Omg3Njg5Yzg2YjczN2FiNTUxUEx3YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfZmlsZV9oZWFkZXI6OmgxMzk3ODZiOTQ2MGJjYWFhUU93YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfc2VjdGlvbl9oZWFkZXI6OmgyYTRmNzhjZjNhYzE4ZGEwUkk8YWxsb2M6OnZlYzo6U3BsaWNlPEk+IGFzIGNvcmU6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6OmgzNThlYzVjOTgyNzc2OTM2U1h3YXNtcGFyc2VyOjpyZWFkZXJzOjpjb2RlX3NlY3Rpb246OkZ1bmN0aW9uQm9keTo6Z2V0X29wZXJhdG9yc19yZWFkZXI6OmgwMTlhMzEyNDM1ZDFiYWMzVD93YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF9yZWxvY19lbnRyeTo6aGY1ODg3OGI5OTMwMGViZThVQHdhc21wYXJzZXI6OnBhcnNlcjo6UGFyc2VyOjpyZWFkX2V4cG9ydF9lbnRyeTo6aDFjMWQ1MTM4ZDI0YmY5MDJWYzxzdGQ6OnBhbmlja2luZzo6YmVnaW5fcGFuaWNfaGFuZGxlcjo6UGFuaWNQYXlsb2FkIGFzIGNvcmU6OnBhbmljOjpCb3hNZVVwPjo6Z2V0OjpoOTNiNTVhMTgzZTk0MDNkZldHd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpyZWFkX3N0cmluZzo6aGNmN2EzMWFmYTA3YTkxZTdYS3dhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF9yZWxvY190eXBlOjpoOTkyYWZhYzllODEyMDc1Y1lKd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpyZWFkX2Jsb2NrdHlwZTo6aDE2NjgxM2U3MTAwZmExMzNaR3dhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF92YXJfdTg6Omg1ODNiZmQ4MzBkODg4NWFjWztjb3JlOjpzbGljZTo6PGltcGwgW1RdPjo6Y29weV9mcm9tX3NsaWNlOjpoYjEyMGJmMTEzNTcyZmRjNFxMd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpyZWFkX2dsb2JhbF90eXBlOjpoNWQ5YTMxMjFjOGIyODJmN11Id2FzbV90cmFuc2Zvcm1lcjo6dXRpbHM6OmdldF91MzJfYXNfYnl0ZXNfZm9yX3ZhcnVuaXQ6OmhkMDNjNmQ5ZWJlMWM2OWEyXmM8Y29yZTo6aXRlcjo6YWRhcHRlcnM6Ok1hcDxJLEY+IGFzIGNvcmU6Oml0ZXI6OnRyYWl0czo6aXRlcmF0b3I6Okl0ZXJhdG9yPjo6Zm9sZDo6aDg2M2I1YzM3ZTJmMGE2NTVfTXdhc21wYXJzZXI6OnJlYWRlcnM6OmNvZGVfc2VjdGlvbjo6Q29kZVNlY3Rpb25SZWFkZXI6OnJlYWQ6OmhhYzRiMTQ5NGQwMTg2Y2YzYEZ3YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6cmVhZF9zZWN0aW9uX2JvZHlfYnl0ZXM6OmhlYmRjNzc4NzhjYzM3ZWE0YWd3YXNtcGFyc2VyOjpyZWFkZXJzOjpzb3VyY2VtYXBwaW5ndXJsX3NlY3Rpb246OnJlYWRfc291cmNlbWFwcGluZ3VybF9zZWN0aW9uX2NvbnRlbnQ6Omg1OGFlM2RmMDEwN2UwMWRkYk53YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfZXh0ZXJuYWxfa2luZDo6aDQ3NjEzOTk5Mjg1NzRkZmVjQndhc21wYXJzZXI6OnBhcnNlcjo6UGFyc2VyOjpyZWFkX2Z1bmN0aW9uX2VudHJ5OjpoYzc2YjBmOGJmMjBhMmMxYWRBd2FzbXBhcnNlcjo6cGFyc2VyOjpQYXJzZXI6OnJlYWRfbGlua2luZ19lbnRyeTo6aDk4YjY4NzVjYmQyNDBkMzNlSHdhc21wYXJzZXI6OnJlYWRlcnM6OmNvZGVfc2VjdGlvbjo6TG9jYWxzUmVhZGVyOjpyZWFkOjpoZmZjMzJiZDc4NGYzM2FiN2ZKd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpyZWFkX25hbWVfdHlwZTo6aDNhZTY0NzE4ZGY1MzgwMDZnTXdhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF9saW5raW5nX3R5cGU6Omg0NzZhMDY0YmI1NWVkMzY2aA9sb3dlckk2NEltcG9ydHNpUXdhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF9yZXNpemFibGVfbGltaXRzOjpoMDVkMmQyMTU2MjUwODkwOGo5Y29yZTo6dW5pY29kZTo6cHJpbnRhYmxlOjppc19wcmludGFibGU6Omg2MmJmNTk0YzI2MzI5NWNla0ljb3JlOjpmbXQ6Om51bTo6PGltcGwgY29yZTo6Zm10OjpMb3dlckhleCBmb3IgaTg+OjpmbXQ6OmgwMjY4OTA5MGE1ZDU0NTc4bEljb3JlOjpmbXQ6Om51bTo6PGltcGwgY29yZTo6Zm10OjpVcHBlckhleCBmb3IgaTg+OjpmbXQ6Omg3ZmZiZWI3OGY0NTFhZDAxbVB3YXNtcGFyc2VyOjpyZWFkZXJzOjplbGVtZW50X3NlY3Rpb246OkVsZW1lbnRJdGVtc1JlYWRlcjo6bmV3OjpoZGZhNWJkMzQ0ZDI1NDIwN25TPGFsbG9jOjp2ZWM6OlZlYzxUPiBhcyBhbGxvYzo6dmVjOjpTcGVjRXh0ZW5kPFQsST4+OjpzcGVjX2V4dGVuZDo6aDBiN2EwNTRiMzA4MmJjNGZvSmNvcmU6OmZtdDo6bnVtOjo8aW1wbCBjb3JlOjpmbXQ6Okxvd2VySGV4IGZvciBpMzI+OjpmbXQ6OmhlNmQyMzUxYWZiYzI5OTE0cEpjb3JlOjpmbXQ6Om51bTo6PGltcGwgY29yZTo6Zm10OjpVcHBlckhleCBmb3IgaTMyPjo6Zm10OjpoYzYyMjBjZjMzNDBlNzliN3FQd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpyZWFkX21lbWFyZ19vZl9hbGlnbjo6aDVjMWI3YmQ4MDc3OTY1NjZyQXdhc21wYXJzZXI6OnJlYWRlcnM6Om1vZHVsZTo6TW9kdWxlUmVhZGVyOjpuZXc6Omg0YjhmMzQ1OGI3MGIxMzMxc1t3YXNtcGFyc2VyOjpyZWFkZXJzOjpkYXRhX2NvdW50X3NlY3Rpb246OnJlYWRfZGF0YV9jb3VudF9zZWN0aW9uX2NvbnRlbnQ6OmhkYzFmZTJkNTY4NTRmZTA4dFF3YXNtcGFyc2VyOjpyZWFkZXJzOjpzdGFydF9zZWN0aW9uOjpyZWFkX3N0YXJ0X3NlY3Rpb25fY29udGVudDo6aGMxNjgyMjNiNDgzY2M3NTl1S3dhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF9sYW5lX2luZGV4OjpoZjgyNjJjM2IwNWU1OGE1YnZId2FzbXBhcnNlcjo6cmVhZGVyczo6bmFtZV9zZWN0aW9uOjpOYW1pbmdSZWFkZXI6OnJlYWQ6OmhmYTE0MTg4MWMzYmVjMWExd1p3YXNtcGFyc2VyOjpyZWFkZXJzOjpuYW1lX3NlY3Rpb246OkxvY2FsTmFtZTo6Z2V0X2Z1bmN0aW9uX2xvY2FsX3JlYWRlcjo6aDVmMjBjZGFiMmY1NGY4ODB4UHdhc21wYXJzZXI6OnJlYWRlcnM6OmV4cG9ydF9zZWN0aW9uOjpFeHBvcnRTZWN0aW9uUmVhZGVyOjpuZXc6OmhlMzA1ZmVlNWE3YTNhZWU0eUx3YXNtcGFyc2VyOjpyZWFkZXJzOjpkYXRhX3NlY3Rpb246OkRhdGFTZWN0aW9uUmVhZGVyOjpuZXc6Omg3YTAwMmEyNzM5NTliMjZhelB3YXNtcGFyc2VyOjpyZWFkZXJzOjpnbG9iYWxfc2VjdGlvbjo6R2xvYmFsU2VjdGlvblJlYWRlcjo6bmV3OjpoZmY2YzA3YWJmNzBlNDliZHtSd2FzbXBhcnNlcjo6cmVhZGVyczo6ZWxlbWVudF9zZWN0aW9uOjpFbGVtZW50U2VjdGlvblJlYWRlcjo6bmV3OjpoOWRjMWU2YWRlNDg4NDEyN3xSd2FzbXBhcnNlcjo6cmVhZGVyczo6bGlua2luZ19zZWN0aW9uOjpMaW5raW5nU2VjdGlvblJlYWRlcjo6bmV3OjpoZWE3MmQ2YmEyZTFkYWFmMH1Hd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpza2lwX3N0cmluZzo6aDU0ZTFlMmExZGIxOTJhMTR+R3dhc21wYXJzZXI6OnJlYWRlcnM6Om5hbWVfc2VjdGlvbjo6TmFtaW5nUmVhZGVyOjpuZXc6Omg0ZjBlY2Q1MDEyM2E1MGJif1R3YXNtcGFyc2VyOjpyZWFkZXJzOjpmdW5jdGlvbl9zZWN0aW9uOjpGdW5jdGlvblNlY3Rpb25SZWFkZXI6Om5ldzo6aGVlODVkZTM1NWExZDkyMWWAAVB3YXNtcGFyc2VyOjpyZWFkZXJzOjppbXBvcnRfc2VjdGlvbjo6SW1wb3J0U2VjdGlvblJlYWRlcjo6bmV3OjpoMjE2NjA3NTMyMjJhMWQ4MoEBUHdhc21wYXJzZXI6OnJlYWRlcnM6Om1lbW9yeV9zZWN0aW9uOjpNZW1vcnlTZWN0aW9uUmVhZGVyOjpuZXc6Omg0MmJmNmQzNzhlNDRkODMzggFOd2FzbXBhcnNlcjo6cmVhZGVyczo6dGFibGVfc2VjdGlvbjo6VGFibGVTZWN0aW9uUmVhZGVyOjpuZXc6OmhkNjQwYzg1YjRjZTY1MmY1gwFMd2FzbXBhcnNlcjo6cmVhZGVyczo6dHlwZV9zZWN0aW9uOjpUeXBlU2VjdGlvblJlYWRlcjo6bmV3OjpoMGUwZWJlNTQ5YjkyNDRiMoQBTHdhc21wYXJzZXI6OnJlYWRlcnM6OmNvZGVfc2VjdGlvbjo6Q29kZVNlY3Rpb25SZWFkZXI6Om5ldzo6aGYwNzI4Y2ZjZDdhYTNhZTGFAT1hbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnNocmlua190b19maXQ6OmhmZTdmMDZlZWNkZDVhMjNkhgE9YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpzaHJpbmtfdG9fZml0OjpoOTQ1YWUzM2YyZjA0ZTE1MYcBPWFsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6c2hyaW5rX3RvX2ZpdDo6aDk2NmE5Y2I1YjUyMGY2OWKIAT1hbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnNocmlua190b19maXQ6OmhhNWQwZDE4ZTg0ZjUwMTBliQE9YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpzaHJpbmtfdG9fZml0OjpoYjhiOTBmNzE3MjdmNzgwMYoBVXdhc21wYXJzZXI6OnJlYWRlcnM6OmNvZGVfc2VjdGlvbjo6RnVuY3Rpb25Cb2R5OjpnZXRfbG9jYWxzX3JlYWRlcjo6aDUxMTYwZGFiOWRkMWYxOTaLAS5hbGxvYzo6dmVjOjpWZWM8VD46OnJlc2VydmU6OmhmMjAzZDk5ODY4MDhlMDEwjAE/d2FzbV9iaW5kZ2VuOjpjb252ZXJ0OjpjbG9zdXJlczo6aW52b2tlM19tdXQ6OmhhNTM3NWEwM2I5MjM2Y2Q5jQEtYWxsb2M6OnZlYzo6RHJhaW48VD46OmZpbGw6OmhmMGUxYjc3YjU0N2E5OTgyjgFHd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpyZWFkX21lbWFyZzo6aDkzNWJlMzcyOGQ4MzlhOTePAVM8YWxsb2M6OnZlYzo6VmVjPFQ+IGFzIGFsbG9jOjp2ZWM6OlNwZWNFeHRlbmQ8VCxJPj46OnNwZWNfZXh0ZW5kOjpoNmEwOWY0N2M2NTUzMWJlMJABB3ZlcnNpb26RAUd3YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfdmFyX3UxOjpoMWY3ZmFlMjBmNDhiNjUzZpIBR3dhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF92YXJfdTc6Omg2ZmYzYTZmNWI2NTlmNjVlkwE9YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpzaHJpbmtfdG9fZml0OjpoMDVjNmJjNjdiZjFiMDk3ZZQBLmNvcmU6OnJlc3VsdDo6dW53cmFwX2ZhaWxlZDo6aDQyNmExZWE5MjYzYjkyNzKVAUg8YWxsb2M6OmJveGVkOjpCb3g8W1RdPiBhcyBjb3JlOjpjbG9uZTo6Q2xvbmU+OjpjbG9uZTo6aDM5YmQ1OGZkNTg4MzhiY2aWATthbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OmFsbG9jYXRlX2luOjpoOTZkYzc3YmQyZDc2ZGIyZpcBO2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6YWxsb2NhdGVfaW46OmhjZjk2MjZmYmNmNzI0Yzk3mAEHbWVtbW92ZZkBO2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6YWxsb2NhdGVfaW46OmgyNWU3YjVmNjMzOTI1YzIwmgE7YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6aGE2ZjJmYmZjMmRkOGQyY2SbAUg8YWxsb2M6OnZlYzo6RHJhaW48VD4gYXMgY29yZTo6b3BzOjpkcm9wOjpEcm9wPjo6ZHJvcDo6aDZkMmY0YzJmNTI4OGJhOGacAUF3YXNtcGFyc2VyOjpwcmltaXRpdmVzOjpCaW5hcnlSZWFkZXJFcnJvcjo6bmV3OjpoMWZlMmNjNTQxMWFlNDg1NJ0BRndhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF9ieXRlczo6aDUyNjFjOTE1NDFlMjYxYzGeAUR3YXNtcGFyc2VyOjpiaW5hcnlfcmVhZGVyOjpCaW5hcnlSZWFkZXI6OnJlYWRfdTY0OjpoODgxY2QyZDg0NjFkYmUyYZ8BLGFsbG9jOjp2ZWM6OlZlYzxUPjo6ZHJhaW46Omg1YWZhYTJiZmJkYjE0OTY1oAFGPGFsbG9jOjp2ZWM6OlZlYzxUPiBhcyBjb3JlOjpvcHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpoZTE1N2YzNzg4YWI1MjQ2ZaEBR3dhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6c2tpcF92YXJfMzI6Omg3ZDMxYWJkZWM3Zjg0NDM1ogERcnVzdF9iZWdpbl91bndpbmSjAUo8Y29yZTo6b3BzOjpyYW5nZTo6UmFuZ2U8SWR4PiBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoNWZmYzIzMzUyZGE2ZTg1MaQBRHdhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF91MzI6OmhiZmNlZTZlNjViMzA0MjY3pQFKd2FzbXBhcnNlcjo6YmluYXJ5X3JlYWRlcjo6QmluYXJ5UmVhZGVyOjpza2lwX2luaXRfZXhwcjo6aGQ2YTgwYWRlM2U0MGFlOTSmAT1hbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnNocmlua190b19maXQ6Omg0YmRhMDRjMDBlODU0YmNkpwEyd2FzbXBhcnNlcjo6cGFyc2VyOjpQYXJzZXI6Om5ldzo6aDg3N2U2ZmQ2ZDk4MGExNjKoATZjb3JlOjpwYW5pY2tpbmc6OnBhbmljX2JvdW5kc19jaGVjazo6aGU4MjczZTYwMGMzYzhmZDCpATRjb3JlOjpzbGljZTo6c2xpY2VfaW5kZXhfbGVuX2ZhaWw6Omg2OGQxNDRjMTQ4YzlkNWY4qgE2Y29yZTo6c2xpY2U6OnNsaWNlX2luZGV4X29yZGVyX2ZhaWw6OmhmYWZhMmQ2ZWNmZDQ4MzQ0qwFEPGNvcmU6OmZtdDo6QXJndW1lbnRzIGFzIGNvcmU6OmZtdDo6RGlzcGxheT46OmZtdDo6aGExZjIyMDg2ZDEwMDRmMzisATZ3YXNtX3RyYW5zZm9ybWVyOjpsb3dlcl9pNjRfaW1wb3J0czo6aGE3Y2JjMjIxYWRlMmFkMzGtAVM8YWxsb2M6OnZlYzo6VmVjPFQ+IGFzIGFsbG9jOjp2ZWM6OlNwZWNFeHRlbmQ8VCxJPj46OnNwZWNfZXh0ZW5kOjpoYzg1MTc3ZDUxOWQxMzYzOK4BOjwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRlX2ZtdDo6aGE2MTVlMGVmMTdhNDM3MjOvAQ1fX3JkbF9yZWFsbG9jsAFEPGFsbG9jOjp2ZWM6OlZlYzxUPiBhcyBjb3JlOjpjbG9uZTo6Q2xvbmU+OjpjbG9uZTo6aDNjNmU2ZGQ3OGEzZjU0NDOxATdhbGxvYzo6dmVjOjpWZWM8VD46OmludG9fYm94ZWRfc2xpY2U6Omg5NjVjMTRmM2EzYjVmZTg2sgEnY29yZTo6c3RyOjpmcm9tX3V0Zjg6OmhlMjljOGU3ZjYzMDQ5MDE5swEtYWxsb2M6OnZlYzo6VmVjPFQ+OjppbnNlcnQ6OmhmMDRlMDMyMjhmMDYxMDE2tAE7YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6aDE1YzI5Y2FlYzFlYmQyZTa1ATthbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OmFsbG9jYXRlX2luOjpoMzdjM2I5ZjNlMGY5Y2RlZrYBLWFsbG9jOjp2ZWM6OlZlYzxUPjo6cmVtb3ZlOjpoYzZiMmMyMDMwODc3MGE4ZLcBLmNvcmU6Om9wdGlvbjo6ZXhwZWN0X2ZhaWxlZDo6aGFjMTVlMDdiMzU5MmUxZjC4AVBhbGxvYzo6c2xpY2U6OjxpbXBsIGFsbG9jOjpib3Jyb3c6OlRvT3duZWQgZm9yIFtUXT46OnRvX293bmVkOjpoODk1NmVmYzkzZDJjYTVmZLkBQ3dhc21wYXJzZXI6OmJpbmFyeV9yZWFkZXI6OkJpbmFyeVJlYWRlcjo6cmVhZF91ODo6aDUxNmU4ZTgyZjdiODAyY2O6AUY8YWxsb2M6OnZlYzo6VmVjPFQ+IGFzIGNvcmU6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6OmgyZDU0N2ZjZDZhNTUyOTZluwFjPHN0ZDo6cGFuaWNraW5nOjpiZWdpbl9wYW5pYzo6UGFuaWNQYXlsb2FkPEE+IGFzIGNvcmU6OnBhbmljOjpCb3hNZVVwPjo6dGFrZV9ib3g6OmhmN2ZjMjBmYzlkNWQyNDEyvAFQd2FzbXBhcnNlcjo6cmVhZGVyczo6bW9kdWxlOjpTZWN0aW9uOjpnZXRfbmFtZV9zZWN0aW9uX3JlYWRlcjo6aDU2NWI0NGU2ZDM0NTUxNWS9ATdhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmU6Omg0ZjNhNDNhNTcwN2QzMWY2vgE3YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlOjpoNTNmNDVlODQxZmMzM2QzMb8BN2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZTo6aDU4NWIwNDZkOWQxOTRmYWbAATdhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmU6Omg3MTgyNjI1M2ZjZTg3YWU2wQE3YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlOjpoZDE2NDJlOGFiZWNjNWFhZMIBN2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZTo6aGRlOWY3N2UwMjAyM2E5YznDATdhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmU6OmhhZGQ5ZWQ0NjhkZDRkYTUyxAE3YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlOjpoMWY4Y2JhMDExNjBhYzc3MMUBN2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZTo6aDRhYzkwODMwYzBjNjg3N2bGATdhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmU6Omg0YzI2ZTM0ZDljZDcyN2EwxwE3YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpyZXNlcnZlOjpoNTFiNDQ5MzkzYjBiZjVlYsgBN2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cmVzZXJ2ZTo6aDg4NTg1ZTNkNDM1NzM0YWHJATdhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQsQT46OnJlc2VydmU6OmhhNzRjNTRmNmQ0OWY1ZGVjygEyYWxsb2M6OnZlYzo6RHJhaW48VD46Om1vdmVfdGFpbDo6aDIwYjE2OGJiNDE1YTViYWXLAQRiY21wzAFDY29yZTo6Zm10OjpGb3JtYXR0ZXI6OnBhZF9pbnRlZ3JhbDo6d3JpdGVfcHJlZml4OjpoNjRkZGQ4YWNlMGU0Y2ZhNc0BSzxhbGxvYzo6dmVjOjpJbnRvSXRlcjxUPiBhcyBjb3JlOjpvcHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpoYTdjYzRmMTE2NmQ2OWU0ZM4BMnN0ZDo6cGFuaWNraW5nOjpiZWdpbl9wYW5pY19mbXQ6OmhjZGE4YjgzYzhhYTA4ZWUwzwESX19yZGxfYWxsb2NfemVyb2Vk0AFTd2FzbXBhcnNlcjo6cmVhZGVyczo6bW9kdWxlOjpTZWN0aW9uOjpnZXRfbGlua2luZ19zZWN0aW9uX3JlYWRlcjo6aGViZGI5Y2MxNjA4OTAzNWHRAVF3YXNtcGFyc2VyOjpyZWFkZXJzOjptb2R1bGU6OlNlY3Rpb246OmdldF9yZWxvY19zZWN0aW9uX3JlYWRlcjo6aDFhNjIyM2U2ZTNlMzA3YjDSAV13YXNtcGFyc2VyOjpyZWFkZXJzOjptb2R1bGU6OlNlY3Rpb246OmdldF9zb3VyY2VtYXBwaW5ndXJsX3NlY3Rpb25fY29udGVudDo6aGU0OTZlZTYzNWVmYTA1NGHTAVJ3YXNtcGFyc2VyOjpwYXJzZXI6OlBhcnNlcjo6Y3JlYXRlX2N1c3RvbV9zZWN0aW9uX2JpbmFyeV9yZWFkZXI6OmhkOWY3N2YyNTBiNTRiYTBm1AFGPGFsbG9jOjp2ZWM6OlZlYzxUPiBhcyBjb3JlOjpvcHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpoMmI3NzRiMjUyYzIyZjNlMtUBUHdhc21wYXJzZXI6OnJlYWRlcnM6Om1vZHVsZTo6TW9kdWxlUmVhZGVyOjp2ZXJpZnlfc2VjdGlvbl9lbmQ6OmhhNDBjMDQ0Y2I5NWViYjI01gEpY29yZTo6cGFuaWNraW5nOjpwYW5pYzo6aDA4ZDAyZWYyN2YwNDE3NGPXAQZtZW1jcHnYATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDkwYjAxMTgyN2U3YTFiMzjZARFfX3diaW5kZ2VuX21hbGxvY9oBQ3dhc21wYXJzZXI6OnBhcnNlcjo6UGFyc2VyOjpyZWFkX2RhdGFfZW50cnlfYm9keTo6aGFmOTg1ZTkwZmJiMjcxMDLbAWc8YWxsb2M6OnZlYzo6VmVjPFQ+IGFzIGFsbG9jOjp2ZWM6OlNwZWNFeHRlbmQ8JlQsY29yZTo6c2xpY2U6Okl0ZXI8VD4+Pjo6c3BlY19leHRlbmQ6OmgyYjhiM2ZmZjVjNjdiMWEx3AEwPCZUIGFzIGNvcmU6OmZtdDo6RGVidWc+OjpmbXQ6Omg0OTEyNTJjMjZmZTM2OWEy3QEwPCZUIGFzIGNvcmU6OmZtdDo6RGVidWc+OjpmbXQ6Omg4YThkN2YyYzA2MmZlZWFj3gFQd2FzbXBhcnNlcjo6cmVhZGVyczo6bW9kdWxlOjpTZWN0aW9uOjpnZXRfdHlwZV9zZWN0aW9uX3JlYWRlcjo6aDBmNjQ1MWE3YjkzMDQxMWPfAVR3YXNtcGFyc2VyOjpyZWFkZXJzOjptb2R1bGU6OlNlY3Rpb246OmdldF9mdW5jdGlvbl9zZWN0aW9uX3JlYWRlcjo6aDNiZjVlNzJkNzc1Njc0NGTgAVB3YXNtcGFyc2VyOjpyZWFkZXJzOjptb2R1bGU6OlNlY3Rpb246OmdldF9jb2RlX3NlY3Rpb25fcmVhZGVyOjpoZGMyNDA3ZTQ2ODIxMTMyZuEBUndhc21wYXJzZXI6OnJlYWRlcnM6Om1vZHVsZTo6U2VjdGlvbjo6Z2V0X2V4cG9ydF9zZWN0aW9uX3JlYWRlcjo6aDdjMmNiZTVmNDAwYzg4MWHiAVJ3YXNtcGFyc2VyOjpyZWFkZXJzOjptb2R1bGU6OlNlY3Rpb246OmdldF9pbXBvcnRfc2VjdGlvbl9yZWFkZXI6OmhkY2RhZWUyOGViMjUxMzQy4wFSd2FzbXBhcnNlcjo6cmVhZGVyczo6bW9kdWxlOjpTZWN0aW9uOjpnZXRfZ2xvYmFsX3NlY3Rpb25fcmVhZGVyOjpoMjg4NzM3NWY0OGJiNTY1M+QBUndhc21wYXJzZXI6OnJlYWRlcnM6Om1vZHVsZTo6U2VjdGlvbjo6Z2V0X21lbW9yeV9zZWN0aW9uX3JlYWRlcjo6aGMyNmRmMWYzYjY2OGQyNjTlAVB3YXNtcGFyc2VyOjpyZWFkZXJzOjptb2R1bGU6OlNlY3Rpb246OmdldF9kYXRhX3NlY3Rpb25fcmVhZGVyOjpoOTJhNDMyOWJhOGU1ZDBlM+YBUXdhc21wYXJzZXI6OnJlYWRlcnM6Om1vZHVsZTo6U2VjdGlvbjo6Z2V0X3RhYmxlX3NlY3Rpb25fcmVhZGVyOjpoMzhlOGU5OTRmYmUyYWU4NecBU3dhc21wYXJzZXI6OnJlYWRlcnM6Om1vZHVsZTo6U2VjdGlvbjo6Z2V0X2VsZW1lbnRfc2VjdGlvbl9yZWFkZXI6OmhjYTM0ZTY3MDQxNGVhNzZm6AFSd2FzbXBhcnNlcjo6cmVhZGVyczo6bW9kdWxlOjpTZWN0aW9uOjpnZXRfc3RhcnRfc2VjdGlvbl9jb250ZW50OjpoYjJmNzE4ZGQ1MDY0YTRiY+kBV3dhc21wYXJzZXI6OnJlYWRlcnM6Om1vZHVsZTo6U2VjdGlvbjo6Z2V0X2RhdGFfY291bnRfc2VjdGlvbl9jb250ZW50OjpoMTQ3ZDY3ZDNmNWQxN2M0YeoBOjwmbXV0IFcgYXMgY29yZTo6Zm10OjpXcml0ZT46OndyaXRlX3N0cjo6aGU2ZGMyMGIxNjUzM2U3MTTrATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDM1ZjE2NmUwNjBjODcwMzjsATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDM1ZjE2NmUwNjBjODcwMzjtATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDM1ZjE2NmUwNjBjODcwMzjuATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDM1ZjE2NmUwNjBjODcwMzjvATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDM1ZjE2NmUwNjBjODcwMzjwATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDM1ZjE2NmUwNjBjODcwMzjxATBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDM1ZjE2NmUwNjBjODcwMzjyAS1jb3JlOjpwYW5pY2tpbmc6OnBhbmljX2ZtdDo6aDdiODBmZWQ3MjU2YmY2NmbzAQZtZW1zZXT0AS5zdGQ6OnBhbmlja2luZzo6YmVnaW5fcGFuaWM6OmgwZmZlYTZmNGQzYzc5MTM59QEwY29yZTo6cHRyOjpyZWFsX2Ryb3BfaW5fcGxhY2U6OmhkMzFiNDk3NmE0OTAwMjZk9gEKcnVzdF9wYW5pY/cBP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTRfbXV0OjpoZGY4ZGIyMTBlOWQ3NTQ1MPgBP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoMTZlNTUwZDBhZTNlYTliZfkBP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoMTlmYTU5Nzc2ZjJiYzdiYfoBP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoMWFjMjI5NjhkOTFlYzIzZPsBP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoMjEwNmQ2NDc1ODQwNGE1NfwBP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoNTQwNmZmZWY5M2VhMmQ2Zv0BP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoNzk0OTM3MmRiOGQ4NDNhOf4BP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoODM5ZDYyZTM2YzFhYzQwOP8BP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoYTVlMjdmZDBmNTU5NTRiNIACP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoYTlmMDM5MWU3MGM3YTQyN4ECP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoYWVjYWZjMTZjMmJjYzc5NYICP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoYjBhODQ2MmY5MWVhMjk5MYMCP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoYjcxOGIwODJjN2Q3ZjI2OIQCP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTNfbXV0OjpoYzQ2NTVjMzUwMWE5MzY3MIUCP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTJfbXV0OjpoN2I0ZDZmMjZkZDY0ZGU1Y4YCP3dhc21fYmluZGdlbjo6Y29udmVydDo6Y2xvc3VyZXM6Omludm9rZTJfbXV0OjpoZTM0MWEwNDRjMjZlYzRhZYcCO3dhc21fYmluZGdlbjo6YW55cmVmOjpIRUFQX1NMQUI6Ol9fZ2V0aXQ6Omg1NzljNTU5NGE5MDRkMTRkiAILX19yZGxfYWxsb2OJAoABY29yZTo6c3RyOjp0cmFpdHM6OjxpbXBsIGNvcmU6OnNsaWNlOjpTbGljZUluZGV4PHN0cj4gZm9yIGNvcmU6Om9wczo6cmFuZ2U6OlJhbmdlPHVzaXplPj46OmluZGV4Ojp7e2Nsb3N1cmV9fTo6aDJiYmM1NGU4ZWI3MzBmZTCKAj93YXNtX2JpbmRnZW46OmNvbnZlcnQ6OmNsb3N1cmVzOjppbnZva2UxX211dDo6aGUzZWNiYTY4NGMxZTcxNTCLAk88YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+IGFzIGNvcmU6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6OmgwYjYzNWJiMjRiMjAyOTgzjAJePHN0ZDo6cGFuaWNraW5nOjpiZWdpbl9wYW5pYzo6UGFuaWNQYXlsb2FkPEE+IGFzIGNvcmU6OnBhbmljOjpCb3hNZVVwPjo6Z2V0OjpoNDUyZGEzZDNiYWQyNjVmMI0CPmNvcmU6OnBhbmljOjpMb2NhdGlvbjo6aW50ZXJuYWxfY29uc3RydWN0b3I6OmgzMzhlZmM1Y2NkYzcyMjkwjgI+YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjpkZWFsbG9jX2J1ZmZlcjo6aGE3MDBlMjhjNmRlODkwOWSPAk88YWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+IGFzIGNvcmU6Om9wczo6ZHJvcDo6RHJvcD46OmRyb3A6OmgwY2UyZjg1YWI0Y2UxMjkykAIwY29yZTo6cHRyOjpyZWFsX2Ryb3BfaW5fcGxhY2U6OmgwNDhhOTJkNmI5NTVhMGQ3kQIIcnVzdF9vb22SAjVhbGxvYzo6dmVjOjpWZWM8VD46OmZyb21fcmF3X3BhcnRzOjpoOTdlZGFiOWZmZGExOWY5NJMCMmNvcmU6Om9wdGlvbjo6T3B0aW9uPFQ+Ojp1bndyYXA6Omg3NzEzMTE2ZDE4NzMyYjc5lAIyY29yZTo6b3B0aW9uOjpPcHRpb248VD46OnVud3JhcDo6aDlkYzIzYmIwMTUyZmZlN2WVAg5fX3J1c3RfcmVhbGxvY5YCSTxhbGxvYzo6dmVjOjpWZWM8VD4gYXMgY29yZTo6b3BzOjpkZXJlZjo6RGVyZWY+OjpkZXJlZjo6aDcyYTQ1MWY0NDcxNjQ2OWWXAkk8YWxsb2M6OnZlYzo6VmVjPFQ+IGFzIGNvcmU6Om9wczo6ZGVyZWY6OkRlcmVmPjo6ZGVyZWY6OmhhMmZiOWEzNTE0ZGMyNjYzmAJQPGFsbG9jOjp2ZWM6OlZlYzxUPiBhcyBjb3JlOjpvcHM6OmRlcmVmOjpEZXJlZk11dD46OmRlcmVmX211dDo6aDIzMmI4MzQ2YjBmN2I5NTaZAlA8YWxsb2M6OnZlYzo6VmVjPFQ+IGFzIGNvcmU6Om9wczo6ZGVyZWY6OkRlcmVmTXV0Pjo6ZGVyZWZfbXV0OjpoOGI3MTVlZTM3NzBmYzE3NpoCD19fd2JpbmRnZW5fZnJlZZsCQmRsbWFsbG9jOjpkbG1hbGxvYzo6RGxtYWxsb2M6OmNhbGxvY19tdXN0X2NsZWFyOjpoYmNhYzkzYWY4NWE1NzcwNZwCMDwmVCBhcyBjb3JlOjpmbXQ6OkRlYnVnPjo6Zm10OjpoNzhhYjhkZjFlODE5MGU1M50CDF9fcnVzdF9hbGxvY54CE19fcnVzdF9hbGxvY196ZXJvZWSfAjxhbGxvYzo6cmF3X3ZlYzo6UmF3VmVjPFQ+Ojpmcm9tX3Jhd19wYXJ0czo6aDg5NDlhOWRlYjkxNDI2ZGSgAjY8VCBhcyBjb3JlOjpjb252ZXJ0OjpGcm9tPFQ+Pjo6ZnJvbTo6aDZmZTY2NjUwZjYyNjNiMzihAjA8JlQgYXMgY29yZTo6Zm10OjpEZWJ1Zz46OmZtdDo6aDY0ZmVlMjIyNTA5ZWQ1MWOiAjI8JlQgYXMgY29yZTo6Zm10OjpEaXNwbGF5Pjo6Zm10OjpoYjllZjg3ZWMzY2IzMWU0OaMCLWNvcmU6OmZtdDo6QXJndW1lbnRWMTo6bmV3OjpoNzUwMzdhYTIwNjg4MDE0ZaQCLWNvcmU6OmZtdDo6QXJndW1lbnRWMTo6bmV3OjpoOTEwNDdjMmJlOTljOGExMqUCTjxJIGFzIGNvcmU6Oml0ZXI6OnRyYWl0czo6Y29sbGVjdDo6SW50b0l0ZXJhdG9yPjo6aW50b19pdGVyOjpoNmY4NjEyODJkOWI1MTMwYqYCTjxJIGFzIGNvcmU6Oml0ZXI6OnRyYWl0czo6Y29sbGVjdDo6SW50b0l0ZXJhdG9yPjo6aW50b19pdGVyOjpoOTQ4ZjYyZjk3YzIzZDc3NqcCOGFsbG9jOjp2ZWM6OlZlYzxUPjo6ZXh0ZW5kX2Zyb21fc2xpY2U6OmhmZWVjNTY3M2YzZjRkNTMzqAIyPCZUIGFzIGNvcmU6OmZtdDo6RGlzcGxheT46OmZtdDo6aGRjMDNiM2YxZjg2N2U0ZjOpAjhjb3JlOjpmbXQ6OkZvcm1hdHRlcjo6ZGVidWdfbG93ZXJfaGV4OjpoMDdmZGNlMTgwMzdmY2UxOaoCOGNvcmU6OmZtdDo6Rm9ybWF0dGVyOjpkZWJ1Z191cHBlcl9oZXg6Omg2OThmZmI2ZTlkYTk4MDI4qwIOX19ydXN0X2RlYWxsb2OsAjY8VCBhcyBjb3JlOjpjb252ZXJ0OjpJbnRvPFU+Pjo6aW50bzo6aDVkNWNkMmEwYjRjMWEyMTetAi5hbGxvYzo6dmVjOjpWZWM8VD46OnJlc2VydmU6Omg5NTAxMDE2NDE5ZDlhOGQzrgIuYWxsb2M6OnZlYzo6VmVjPFQ+OjpyZXNlcnZlOjpoZTAyOTJiZDgyM2QxMmJkOa8CNGFsbG9jOjpyYXdfdmVjOjpjYXBhY2l0eV9vdmVyZmxvdzo6aGI4ZjQzMzRjNjgxZmUzZTSwAk5jb3JlOjpmbXQ6Om51bTo6aW1wOjo8aW1wbCBjb3JlOjpmbXQ6OkRpc3BsYXkgZm9yIHUzMj46OmZtdDo6aDEwN2VlN2E4ODEwZDBjNTGxAk1jb3JlOjpmbXQ6Om51bTo6aW1wOjo8aW1wbCBjb3JlOjpmbXQ6OkRpc3BsYXkgZm9yIHU4Pjo6Zm10OjpoYjg4OTg5ZTI2MjY2NjFkZLICNGNvcmU6OmZtdDo6QXJndW1lbnRWMTo6c2hvd191c2l6ZTo6aDMyMDZjMjhhNDY1ZTY5NTazAip3YXNtX2JpbmRnZW46OnRocm93X3N0cjo6aDRhYTFhMjFkZGIyZjg3Mma0AjNhbGxvYzo6YWxsb2M6OmhhbmRsZV9hbGxvY19lcnJvcjo6aGUyOWM4MTI3YjE3NzZlYWS1Ai5jb3JlOjpwYW5pYzo6TG9jYXRpb246OmZpbGU6Omg3ZDQ3MWU2YTk4YmI4OWY5tgIzPHN0ciBhcyBjb3JlOjpmbXQ6OkRpc3BsYXk+OjpmbXQ6Omg0NWRlMDI1MWU2NDA4ODVltwINX19yZGxfZGVhbGxvY7gCM2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cHRyOjpoZjViMGE0NzgxZDc3YmU2N7kCM2FsbG9jOjpyYXdfdmVjOjpSYXdWZWM8VCxBPjo6cHRyOjpoZmVjM2RkZjg5NGU2ZjEyYroCNXdhc21fYmluZGdlbjo6X19ydDo6bWFsbG9jX2ZhaWx1cmU6Omg3M2JhNDBlODA4M2QzMmUxuwJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06OmgzYWFjZDE2ZTM3MDk2Y2RmvAJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06OmhmMjFhZTY3NWMxOTAyY2Y4vQJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06OmhhM2JiNzE1ZTQ5NDJkMTZlvgJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06Omg2MjA1MzdiYTA5NTlkNGFlvwJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06Omg2ZDUzMTI2OWUzMmI1ODNhwAJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06OmhmNDFkOGI0YTZhZmU2ZjkxwQJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06Omg0MjcyYmI3ODdmZDA4YzAywgJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06Omg1ODdkMzZlOTY0MTIxZDBlwwJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06OmhjOWY0MTY3YjgwYzhiYzA1xAJIYWxsb2M6OnJhd192ZWM6OlJhd1ZlYzxULEE+OjphbGxvY2F0ZV9pbjo6e3tjbG9zdXJlfX06Omg2Njg0MTBhNDdhMjI4OTExxQIyY29yZTo6cGFuaWM6OlBhbmljSW5mbzo6bWVzc2FnZTo6aDkzZGFkMDE4ZTA2YTc4NTfGAjNjb3JlOjpwYW5pYzo6UGFuaWNJbmZvOjpsb2NhdGlvbjo6aDg0OTQwNzg5MzhkOWJmZWTHAi5jb3JlOjpwYW5pYzo6TG9jYXRpb246OmxpbmU6Omg0MDA2NzdiODg5MzY3MjIyyAIwY29yZTo6cGFuaWM6OkxvY2F0aW9uOjpjb2x1bW46OmgwZmI3NGQ4ODRmYWY2Mzc5yQI9PFQgYXMgY29yZTo6Y29udmVydDo6VHJ5RnJvbTxVPj46OnRyeV9mcm9tOjpoODZjYTlmYTYxZThhMjUzZMoCMTxUIGFzIGNvcmU6OmFueTo6QW55Pjo6dHlwZV9pZDo6aGRjMGUwNjZhZmZhMDY5ZTDLAjE8VCBhcyBjb3JlOjphbnk6OkFueT46OnR5cGVfaWQ6OmhkNWU4MGFjZmUxOGU4ZDllzAIxPFQgYXMgY29yZTo6YW55OjpBbnk+Ojp0eXBlX2lkOjpoZTBiODg4OWNlZmZlMTQwNs0CJnN0ZDo6cHJvY2Vzczo6YWJvcnQ6OmgyY2Q3NTkxNzE3MDA4MzE2zgISX19ydXN0X3N0YXJ0X3BhbmljzwJBZGxtYWxsb2M6OmRsbWFsbG9jOjpEbG1hbGxvYzo6bWFsbG9jX2FsaWdubWVudDo6aDVjZTRlMjE1NGQ1MWE4ZGPQAjE8VCBhcyBjb3JlOjphbnk6OkFueT46OnR5cGVfaWQ6Omg5ZDcxMGJmNWI3MzkzMTc20QIwY29yZTo6cHRyOjpyZWFsX2Ryb3BfaW5fcGxhY2U6OmhlOGY1OTNlN2QxMjAyODQ10gIwY29yZTo6cHRyOjpyZWFsX2Ryb3BfaW5fcGxhY2U6OmhlOGY1OTNlN2QxMjAyODQ10wIwY29yZTo6cHRyOjpyZWFsX2Ryb3BfaW5fcGxhY2U6OmhlOGY1OTNlN2QxMjAyODQ11AI2PFQgYXMgY29yZTo6Y29udmVydDo6RnJvbTxUPj46OmZyb206OmgwMmM4M2M1ZDg2MWRjYjJm1QI2PFQgYXMgY29yZTo6Y29udmVydDo6RnJvbTxUPj46OmZyb206Omg1M2RhMTRmMDE5NWNhNTZm1gJGPGFsbG9jOjp2ZWM6OlZlYzxUPiBhcyBjb3JlOjpvcHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpoMjg3MTUxNWMxZmZmYWE4MdcCRjxhbGxvYzo6dmVjOjpWZWM8VD4gYXMgY29yZTo6b3BzOjpkcm9wOjpEcm9wPjo6ZHJvcDo6aDhjMDdmY2U0MGE5MDJmNzDYAjY8VCBhcyBjb3JlOjpjb252ZXJ0OjpGcm9tPFQ+Pjo6ZnJvbTo6aGE5MWJkYzkxMWYwZDA3ZWTZAjBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDc5NmU4MjFmNTJjMWExZDbaAjBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aGUwYWRmYmNiODEwMmIzN2LbAjBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDA0OWM5ODgwNTE5MmU3OTHcAlY8c3RkOjpzeXNfY29tbW9uOjp0aHJlYWRfbG9jYWw6OktleSBhcyBjb3JlOjpvcHM6OmRyb3A6OkRyb3A+Ojpkcm9wOjpoOWNlMzlhMTAyZDY1M2EyMN0CN3N0ZDo6YWxsb2M6OmRlZmF1bHRfYWxsb2NfZXJyb3JfaG9vazo6aDE4YzNjMmE5NmViYTQxYjHeAjBjb3JlOjpwdHI6OnJlYWxfZHJvcF9pbl9wbGFjZTo6aDhhMjNlY2I3NWZhMTdiZWMAg4GAgAAJcHJvZHVjZXJzAghsYW5ndWFnZQEEUnVzdAAMcHJvY2Vzc2VkLWJ5AwVydXN0YyUxLjQxLjAtbmlnaHRseSAoMTliZDkzNDY3IDIwMTktMTItMTgpBndhbHJ1cwYwLjEyLjAMd2FzbS1iaW5kZ2VuEjAuMi41MSAoNmQxZGM4MTNjKQ==";
let wasm;
let cachegetInt32Memory = null;

function getInt32Memory() {
  if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
    cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
  }

  return cachegetInt32Memory;
}

let cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
let cachegetUint8Memory = null;

function getUint8Memory() {
  if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
  }

  return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}
/**
* get the versioon of the package
* @returns {string}
*/


function version() {
  const retptr = 8;
  const ret = wasm.version(retptr);
  const memi32 = getInt32Memory();
  const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();

  wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);

  return v0;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm(arg) {
  const ptr = wasm.__wbindgen_malloc(arg.length * 1);

  getUint8Memory().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function getArrayU8FromWasm(ptr, len) {
  return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}
/**
* i64 lowering that can be done by the browser
* @param {Uint8Array} wasm_binary
* @returns {Uint8Array}
*/


function lowerI64Imports(wasm_binary) {
  const retptr = 8;
  const ret = wasm.lowerI64Imports(retptr, passArray8ToWasm(wasm_binary), WASM_VECTOR_LEN);
  const memi32 = getInt32Memory();
  const v0 = getArrayU8FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();

  wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);

  return v0;
}

function init(module) {
  let result;
  const imports = {};
  imports.wbg = {};

  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm(arg0, arg1));
  };

  if (typeof URL === 'function' && module instanceof URL || typeof module === 'string' || typeof Request === 'function' && module instanceof Request) {
    const response = fetch(module);

    if (typeof WebAssembly.instantiateStreaming === 'function') {
      result = WebAssembly.instantiateStreaming(response, imports).catch(e => {
        return response.then(r => {
          if (r.headers.get('Content-Type') != 'application/wasm') {
            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
            return r.arrayBuffer();
          } else {
            throw e;
          }
        }).then(bytes => WebAssembly.instantiate(bytes, imports));
      });
    } else {
      result = response.then(r => r.arrayBuffer()).then(bytes => WebAssembly.instantiate(bytes, imports));
    }
  } else {
    result = WebAssembly.instantiate(module, imports).then(result => {
      if (result instanceof WebAssembly.Instance) {
        return {
          instance: result,
          module
        };
      } else {
        return result;
      }
    });
  }

  return result.then(({
    instance,
    module
  }) => {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    return wasm;
  });
}

const e = async () => (async e => {
  try {
    const a = BigInt(0);
    return (await WebAssembly.instantiate(e)).instance.exports.b(a) === a;
  } catch (e) {
    return !1;
  }
})(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 126, 1, 126, 3, 2, 1, 0, 7, 5, 1, 1, 98, 0, 0, 10, 6, 1, 4, 0, 32, 0, 11])); // @ts-ignore


var initPromise = init(wasmTransformerWasmUrl);

var lowerI64Imports$1 = function (wasmBinary) {
  return __awaiter(void 0, void 0, void 0, function () {
    var isBigIntSupported;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , e()];

        case 1:
          isBigIntSupported = _a.sent();

          if (isBigIntSupported) {
            return [2
            /*return*/
            , wasmBinary];
          }

          return [4
          /*yield*/
          , initPromise];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , lowerI64Imports(wasmBinary)];
      }
    });
  });
};

exports.lowerI64Imports = lowerI64Imports$1;

var version$1 = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , initPromise];

        case 1:
          _a.sent();

          return [2
          /*return*/
          , version()];
      }
    });
  });
};

exports.version = version$1;
},{}],"gRtQ":[function(require,module,exports) {
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WasmFs = exports.default = void 0;

/*
 *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
**************************************************************************** https://mths.be/punycode v1.4.1 by @mathias */
function ba(a, b, c, d) {
  return new (c || (c = Promise))(function (e, f) {
    function g(a) {
      try {
        k(d.next(a));
      } catch (n) {
        f(n);
      }
    }

    function h(a) {
      try {
        k(d["throw"](a));
      } catch (n) {
        f(n);
      }
    }

    function k(a) {
      a.done ? e(a.value) : new c(function (b) {
        b(a.value);
      }).then(g, h);
    }

    k((d = d.apply(a, b || [])).next());
  });
}

function ca(a, b) {
  function c(a) {
    return function (b) {
      return d([a, b]);
    };
  }

  function d(c) {
    if (f) throw new TypeError("Generator is already executing.");

    for (; e;) try {
      if (f = 1, g && (h = c[0] & 2 ? g["return"] : c[0] ? g["throw"] || ((h = g["return"]) && h.call(g), 0) : g.next) && !(h = h.call(g, c[1])).done) return h;
      if (g = 0, h) c = [c[0] & 2, h.value];

      switch (c[0]) {
        case 0:
        case 1:
          h = c;
          break;

        case 4:
          return e.label++, {
            value: c[1],
            done: !1
          };

        case 5:
          e.label++;
          g = c[1];
          c = [0];
          continue;

        case 7:
          c = e.ops.pop();
          e.trys.pop();
          continue;

        default:
          if (!(h = e.trys, h = 0 < h.length && h[h.length - 1]) && (6 === c[0] || 2 === c[0])) {
            e = 0;
            continue;
          }

          if (3 === c[0] && (!h || c[1] > h[0] && c[1] < h[3])) e.label = c[1];else if (6 === c[0] && e.label < h[1]) e.label = h[1], h = c;else if (h && e.label < h[2]) e.label = h[2], e.ops.push(c);else {
            h[2] && e.ops.pop();
            e.trys.pop();
            continue;
          }
      }

      c = b.call(a, e);
    } catch (n) {
      c = [6, n], g = 0;
    } finally {
      f = h = 0;
    }

    if (c[0] & 5) throw c[1];
    return {
      value: c[0] ? c[1] : void 0,
      done: !0
    };
  }

  var e = {
    label: 0,
    sent: function () {
      if (h[0] & 1) throw h[1];
      return h[1];
    },
    trys: [],
    ops: []
  },
      f,
      g,
      h,
      k;
  return k = {
    next: c(0),
    "throw": c(1),
    "return": c(2)
  }, "function" === typeof Symbol && (k[Symbol.iterator] = function () {
    return this;
  }), k;
}

function da(a) {
  var b = "function" === typeof Symbol && a[Symbol.iterator],
      c = 0;
  return b ? b.call(a) : {
    next: function () {
      a && c >= a.length && (a = void 0);
      return {
        value: a && a[c++],
        done: !a
      };
    }
  };
}

function ea(a, b) {
  var c = "function" === typeof Symbol && a[Symbol.iterator];
  if (!c) return a;
  a = c.call(a);
  var d,
      e = [];

  try {
    for (; (void 0 === b || 0 < b--) && !(d = a.next()).done;) e.push(d.value);
  } catch (g) {
    var f = {
      error: g
    };
  } finally {
    try {
      d && !d.done && (c = a["return"]) && c.call(a);
    } finally {
      if (f) throw f.error;
    }
  }

  return e;
}

function ia() {
  for (var a = [], b = 0; b < arguments.length; b++) a = a.concat(ea(arguments[b]));

  return a;
}

var l = "undefined" !== typeof globalThis ? globalThis : "undefined" !== typeof window ? window : "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : {};

function t(a) {
  return a && a.__esModule && Object.prototype.hasOwnProperty.call(a, "default") ? a["default"] : a;
}

function u(a, b) {
  return b = {
    exports: {}
  }, a(b, b.exports), b.exports;
}

var w = u(function (a, b) {
  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  b.constants = {
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    S_IFMT: 61440,
    S_IFREG: 32768,
    S_IFDIR: 16384,
    S_IFCHR: 8192,
    S_IFBLK: 24576,
    S_IFIFO: 4096,
    S_IFLNK: 40960,
    S_IFSOCK: 49152,
    O_CREAT: 64,
    O_EXCL: 128,
    O_NOCTTY: 256,
    O_TRUNC: 512,
    O_APPEND: 1024,
    O_DIRECTORY: 65536,
    O_NOATIME: 262144,
    O_NOFOLLOW: 131072,
    O_SYNC: 1052672,
    O_DIRECT: 16384,
    O_NONBLOCK: 2048,
    S_IRWXU: 448,
    S_IRUSR: 256,
    S_IWUSR: 128,
    S_IXUSR: 64,
    S_IRWXG: 56,
    S_IRGRP: 32,
    S_IWGRP: 16,
    S_IXGRP: 8,
    S_IRWXO: 7,
    S_IROTH: 4,
    S_IWOTH: 2,
    S_IXOTH: 1,
    F_OK: 0,
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
    UV_FS_SYMLINK_DIR: 1,
    UV_FS_SYMLINK_JUNCTION: 2,
    UV_FS_COPYFILE_EXCL: 1,
    UV_FS_COPYFILE_FICLONE: 2,
    UV_FS_COPYFILE_FICLONE_FORCE: 4,
    COPYFILE_EXCL: 1,
    COPYFILE_FICLONE: 2,
    COPYFILE_FICLONE_FORCE: 4
  };
});
t(w);
var ja = u(function (a, b) {
  b.default = "function" === typeof BigInt ? BigInt : function () {
    throw Error("BigInt is not supported in this environment.");
  };
}),
    ka = u(function (a, b) {
  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  var c = w.constants.S_IFMT,
      d = w.constants.S_IFDIR,
      e = w.constants.S_IFREG,
      f = w.constants.S_IFBLK,
      g = w.constants.S_IFCHR,
      h = w.constants.S_IFLNK,
      k = w.constants.S_IFIFO,
      p = w.constants.S_IFSOCK;

  a = function () {
    function a() {}

    a.build = function (b, c) {
      void 0 === c && (c = !1);
      var d = new a(),
          e = b.gid,
          f = b.atime,
          g = b.mtime,
          h = b.ctime;
      c = c ? ja.default : function (a) {
        return a;
      };
      d.uid = c(b.uid);
      d.gid = c(e);
      d.rdev = c(0);
      d.blksize = c(4096);
      d.ino = c(b.ino);
      d.size = c(b.getSize());
      d.blocks = c(1);
      d.atime = f;
      d.mtime = g;
      d.ctime = h;
      d.birthtime = h;
      d.atimeMs = c(f.getTime());
      d.mtimeMs = c(g.getTime());
      e = c(h.getTime());
      d.ctimeMs = e;
      d.birthtimeMs = e;
      d.dev = c(0);
      d.mode = c(b.mode);
      d.nlink = c(b.nlink);
      return d;
    };

    a.prototype._checkModeProperty = function (a) {
      return (Number(this.mode) & c) === a;
    };

    a.prototype.isDirectory = function () {
      return this._checkModeProperty(d);
    };

    a.prototype.isFile = function () {
      return this._checkModeProperty(e);
    };

    a.prototype.isBlockDevice = function () {
      return this._checkModeProperty(f);
    };

    a.prototype.isCharacterDevice = function () {
      return this._checkModeProperty(g);
    };

    a.prototype.isSymbolicLink = function () {
      return this._checkModeProperty(h);
    };

    a.prototype.isFIFO = function () {
      return this._checkModeProperty(k);
    };

    a.prototype.isSocket = function () {
      return this._checkModeProperty(p);
    };

    return a;
  }();

  b.Stats = a;
  b.default = a;
});
t(ka);
var la = "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {},
    x = [],
    y = [],
    ma = "undefined" !== typeof Uint8Array ? Uint8Array : Array,
    oa = !1;

function pa() {
  oa = !0;

  for (var a = 0; 64 > a; ++a) x[a] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[a], y["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(a)] = a;

  y[45] = 62;
  y[95] = 63;
}

function qa(a, b, c) {
  for (var d = [], e = b; e < c; e += 3) b = (a[e] << 16) + (a[e + 1] << 8) + a[e + 2], d.push(x[b >> 18 & 63] + x[b >> 12 & 63] + x[b >> 6 & 63] + x[b & 63]);

  return d.join("");
}

function ra(a) {
  oa || pa();

  for (var b = a.length, c = b % 3, d = "", e = [], f = 0, g = b - c; f < g; f += 16383) e.push(qa(a, f, f + 16383 > g ? g : f + 16383));

  1 === c ? (a = a[b - 1], d += x[a >> 2], d += x[a << 4 & 63], d += "==") : 2 === c && (a = (a[b - 2] << 8) + a[b - 1], d += x[a >> 10], d += x[a >> 4 & 63], d += x[a << 2 & 63], d += "=");
  e.push(d);
  return e.join("");
}

function sa(a, b, c, d, e) {
  var f = 8 * e - d - 1;
  var g = (1 << f) - 1,
      h = g >> 1,
      k = -7;
  e = c ? e - 1 : 0;
  var p = c ? -1 : 1,
      n = a[b + e];
  e += p;
  c = n & (1 << -k) - 1;
  n >>= -k;

  for (k += f; 0 < k; c = 256 * c + a[b + e], e += p, k -= 8);

  f = c & (1 << -k) - 1;
  c >>= -k;

  for (k += d; 0 < k; f = 256 * f + a[b + e], e += p, k -= 8);

  if (0 === c) c = 1 - h;else {
    if (c === g) return f ? NaN : Infinity * (n ? -1 : 1);
    f += Math.pow(2, d);
    c -= h;
  }
  return (n ? -1 : 1) * f * Math.pow(2, c - d);
}

function ta(a, b, c, d, e, f) {
  var g,
      h = 8 * f - e - 1,
      k = (1 << h) - 1,
      p = k >> 1,
      n = 23 === e ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  f = d ? 0 : f - 1;
  var q = d ? 1 : -1,
      B = 0 > b || 0 === b && 0 > 1 / b ? 1 : 0;
  b = Math.abs(b);
  isNaN(b) || Infinity === b ? (b = isNaN(b) ? 1 : 0, d = k) : (d = Math.floor(Math.log(b) / Math.LN2), 1 > b * (g = Math.pow(2, -d)) && (d--, g *= 2), b = 1 <= d + p ? b + n / g : b + n * Math.pow(2, 1 - p), 2 <= b * g && (d++, g /= 2), d + p >= k ? (b = 0, d = k) : 1 <= d + p ? (b = (b * g - 1) * Math.pow(2, e), d += p) : (b = b * Math.pow(2, p - 1) * Math.pow(2, e), d = 0));

  for (; 8 <= e; a[c + f] = b & 255, f += q, b /= 256, e -= 8);

  d = d << e | b;

  for (h += e; 0 < h; a[c + f] = d & 255, f += q, d /= 256, h -= 8);

  a[c + f - q] |= 128 * B;
}

var wa = {}.toString,
    ya = Array.isArray || function (a) {
  return "[object Array]" == wa.call(a);
};

z.TYPED_ARRAY_SUPPORT = void 0 !== la.TYPED_ARRAY_SUPPORT ? la.TYPED_ARRAY_SUPPORT : !0;
var za = z.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;

function Aa(a, b) {
  if ((z.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823) < b) throw new RangeError("Invalid typed array length");
  z.TYPED_ARRAY_SUPPORT ? (a = new Uint8Array(b), a.__proto__ = z.prototype) : (null === a && (a = new z(b)), a.length = b);
  return a;
}

function z(a, b, c) {
  if (!(z.TYPED_ARRAY_SUPPORT || this instanceof z)) return new z(a, b, c);

  if ("number" === typeof a) {
    if ("string" === typeof b) throw Error("If encoding is specified then the first argument must be a string");
    return Ba(this, a);
  }

  return Ca(this, a, b, c);
}

z.poolSize = 8192;

z._augment = function (a) {
  a.__proto__ = z.prototype;
  return a;
};

function Ca(a, b, c, d) {
  if ("number" === typeof b) throw new TypeError('"value" argument must not be a number');

  if ("undefined" !== typeof ArrayBuffer && b instanceof ArrayBuffer) {
    b.byteLength;
    if (0 > c || b.byteLength < c) throw new RangeError("'offset' is out of bounds");
    if (b.byteLength < c + (d || 0)) throw new RangeError("'length' is out of bounds");
    b = void 0 === c && void 0 === d ? new Uint8Array(b) : void 0 === d ? new Uint8Array(b, c) : new Uint8Array(b, c, d);
    z.TYPED_ARRAY_SUPPORT ? (a = b, a.__proto__ = z.prototype) : a = Da(a, b);
    return a;
  }

  if ("string" === typeof b) {
    d = a;
    a = c;
    if ("string" !== typeof a || "" === a) a = "utf8";
    if (!z.isEncoding(a)) throw new TypeError('"encoding" must be a valid string encoding');
    c = Ea(b, a) | 0;
    d = Aa(d, c);
    b = d.write(b, a);
    b !== c && (d = d.slice(0, b));
    return d;
  }

  return Fa(a, b);
}

z.from = function (a, b, c) {
  return Ca(null, a, b, c);
};

z.TYPED_ARRAY_SUPPORT && (z.prototype.__proto__ = Uint8Array.prototype, z.__proto__ = Uint8Array);

function Ga(a) {
  if ("number" !== typeof a) throw new TypeError('"size" argument must be a number');
  if (0 > a) throw new RangeError('"size" argument must not be negative');
}

z.alloc = function (a, b, c) {
  Ga(a);
  a = 0 >= a ? Aa(null, a) : void 0 !== b ? "string" === typeof c ? Aa(null, a).fill(b, c) : Aa(null, a).fill(b) : Aa(null, a);
  return a;
};

function Ba(a, b) {
  Ga(b);
  a = Aa(a, 0 > b ? 0 : Ma(b) | 0);
  if (!z.TYPED_ARRAY_SUPPORT) for (var c = 0; c < b; ++c) a[c] = 0;
  return a;
}

z.allocUnsafe = function (a) {
  return Ba(null, a);
};

z.allocUnsafeSlow = function (a) {
  return Ba(null, a);
};

function Da(a, b) {
  var c = 0 > b.length ? 0 : Ma(b.length) | 0;
  a = Aa(a, c);

  for (var d = 0; d < c; d += 1) a[d] = b[d] & 255;

  return a;
}

function Fa(a, b) {
  if (A(b)) {
    var c = Ma(b.length) | 0;
    a = Aa(a, c);
    if (0 === a.length) return a;
    b.copy(a, 0, 0, c);
    return a;
  }

  if (b) {
    if ("undefined" !== typeof ArrayBuffer && b.buffer instanceof ArrayBuffer || "length" in b) return (c = "number" !== typeof b.length) || (c = b.length, c = c !== c), c ? Aa(a, 0) : Da(a, b);
    if ("Buffer" === b.type && ya(b.data)) return Da(a, b.data);
  }

  throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}

function Ma(a) {
  if (a >= (z.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823)) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + (z.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823).toString(16) + " bytes");
  return a | 0;
}

z.isBuffer = Na;

function A(a) {
  return !(null == a || !a._isBuffer);
}

z.compare = function (a, b) {
  if (!A(a) || !A(b)) throw new TypeError("Arguments must be Buffers");
  if (a === b) return 0;

  for (var c = a.length, d = b.length, e = 0, f = Math.min(c, d); e < f; ++e) if (a[e] !== b[e]) {
    c = a[e];
    d = b[e];
    break;
  }

  return c < d ? -1 : d < c ? 1 : 0;
};

z.isEncoding = function (a) {
  switch (String(a).toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "latin1":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      return !0;

    default:
      return !1;
  }
};

z.concat = function (a, b) {
  if (!ya(a)) throw new TypeError('"list" argument must be an Array of Buffers');
  if (0 === a.length) return z.alloc(0);
  var c;
  if (void 0 === b) for (c = b = 0; c < a.length; ++c) b += a[c].length;
  b = z.allocUnsafe(b);
  var d = 0;

  for (c = 0; c < a.length; ++c) {
    var e = a[c];
    if (!A(e)) throw new TypeError('"list" argument must be an Array of Buffers');
    e.copy(b, d);
    d += e.length;
  }

  return b;
};

function Ea(a, b) {
  if (A(a)) return a.length;
  if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(a) || a instanceof ArrayBuffer)) return a.byteLength;
  "string" !== typeof a && (a = "" + a);
  var c = a.length;
  if (0 === c) return 0;

  for (var d = !1;;) switch (b) {
    case "ascii":
    case "latin1":
    case "binary":
      return c;

    case "utf8":
    case "utf-8":
    case void 0:
      return Oa(a).length;

    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      return 2 * c;

    case "hex":
      return c >>> 1;

    case "base64":
      return Pa(a).length;

    default:
      if (d) return Oa(a).length;
      b = ("" + b).toLowerCase();
      d = !0;
  }
}

z.byteLength = Ea;

function Qa(a, b, c) {
  var d = !1;
  if (void 0 === b || 0 > b) b = 0;
  if (b > this.length) return "";
  if (void 0 === c || c > this.length) c = this.length;
  if (0 >= c) return "";
  c >>>= 0;
  b >>>= 0;
  if (c <= b) return "";

  for (a || (a = "utf8");;) switch (a) {
    case "hex":
      a = b;
      b = c;
      c = this.length;
      if (!a || 0 > a) a = 0;
      if (!b || 0 > b || b > c) b = c;
      d = "";

      for (c = a; c < b; ++c) a = d, d = this[c], d = 16 > d ? "0" + d.toString(16) : d.toString(16), d = a + d;

      return d;

    case "utf8":
    case "utf-8":
      return Ra(this, b, c);

    case "ascii":
      a = "";

      for (c = Math.min(this.length, c); b < c; ++b) a += String.fromCharCode(this[b] & 127);

      return a;

    case "latin1":
    case "binary":
      a = "";

      for (c = Math.min(this.length, c); b < c; ++b) a += String.fromCharCode(this[b]);

      return a;

    case "base64":
      return b = 0 === b && c === this.length ? ra(this) : ra(this.slice(b, c)), b;

    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      b = this.slice(b, c);
      c = "";

      for (a = 0; a < b.length; a += 2) c += String.fromCharCode(b[a] + 256 * b[a + 1]);

      return c;

    default:
      if (d) throw new TypeError("Unknown encoding: " + a);
      a = (a + "").toLowerCase();
      d = !0;
  }
}

z.prototype._isBuffer = !0;

function Sa(a, b, c) {
  var d = a[b];
  a[b] = a[c];
  a[c] = d;
}

z.prototype.swap16 = function () {
  var a = this.length;
  if (0 !== a % 2) throw new RangeError("Buffer size must be a multiple of 16-bits");

  for (var b = 0; b < a; b += 2) Sa(this, b, b + 1);

  return this;
};

z.prototype.swap32 = function () {
  var a = this.length;
  if (0 !== a % 4) throw new RangeError("Buffer size must be a multiple of 32-bits");

  for (var b = 0; b < a; b += 4) Sa(this, b, b + 3), Sa(this, b + 1, b + 2);

  return this;
};

z.prototype.swap64 = function () {
  var a = this.length;
  if (0 !== a % 8) throw new RangeError("Buffer size must be a multiple of 64-bits");

  for (var b = 0; b < a; b += 8) Sa(this, b, b + 7), Sa(this, b + 1, b + 6), Sa(this, b + 2, b + 5), Sa(this, b + 3, b + 4);

  return this;
};

z.prototype.toString = function () {
  var a = this.length | 0;
  return 0 === a ? "" : 0 === arguments.length ? Ra(this, 0, a) : Qa.apply(this, arguments);
};

z.prototype.equals = function (a) {
  if (!A(a)) throw new TypeError("Argument must be a Buffer");
  return this === a ? !0 : 0 === z.compare(this, a);
};

z.prototype.inspect = function () {
  var a = "";
  0 < this.length && (a = this.toString("hex", 0, 50).match(/.{2}/g).join(" "), 50 < this.length && (a += " ... "));
  return "<Buffer " + a + ">";
};

z.prototype.compare = function (a, b, c, d, e) {
  if (!A(a)) throw new TypeError("Argument must be a Buffer");
  void 0 === b && (b = 0);
  void 0 === c && (c = a ? a.length : 0);
  void 0 === d && (d = 0);
  void 0 === e && (e = this.length);
  if (0 > b || c > a.length || 0 > d || e > this.length) throw new RangeError("out of range index");
  if (d >= e && b >= c) return 0;
  if (d >= e) return -1;
  if (b >= c) return 1;
  b >>>= 0;
  c >>>= 0;
  d >>>= 0;
  e >>>= 0;
  if (this === a) return 0;
  var f = e - d,
      g = c - b,
      h = Math.min(f, g);
  d = this.slice(d, e);
  a = a.slice(b, c);

  for (b = 0; b < h; ++b) if (d[b] !== a[b]) {
    f = d[b];
    g = a[b];
    break;
  }

  return f < g ? -1 : g < f ? 1 : 0;
};

function Ta(a, b, c, d, e) {
  if (0 === a.length) return -1;
  "string" === typeof c ? (d = c, c = 0) : 2147483647 < c ? c = 2147483647 : -2147483648 > c && (c = -2147483648);
  c = +c;
  isNaN(c) && (c = e ? 0 : a.length - 1);
  0 > c && (c = a.length + c);

  if (c >= a.length) {
    if (e) return -1;
    c = a.length - 1;
  } else if (0 > c) if (e) c = 0;else return -1;

  "string" === typeof b && (b = z.from(b, d));
  if (A(b)) return 0 === b.length ? -1 : Ua(a, b, c, d, e);
  if ("number" === typeof b) return b &= 255, z.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf ? e ? Uint8Array.prototype.indexOf.call(a, b, c) : Uint8Array.prototype.lastIndexOf.call(a, b, c) : Ua(a, [b], c, d, e);
  throw new TypeError("val must be string, number or Buffer");
}

function Ua(a, b, c, d, e) {
  function f(a, b) {
    return 1 === g ? a[b] : a.readUInt16BE(b * g);
  }

  var g = 1,
      h = a.length,
      k = b.length;

  if (void 0 !== d && (d = String(d).toLowerCase(), "ucs2" === d || "ucs-2" === d || "utf16le" === d || "utf-16le" === d)) {
    if (2 > a.length || 2 > b.length) return -1;
    g = 2;
    h /= 2;
    k /= 2;
    c /= 2;
  }

  if (e) {
    for (d = -1; c < h; c++) if (f(a, c) === f(b, -1 === d ? 0 : c - d)) {
      if (-1 === d && (d = c), c - d + 1 === k) return d * g;
    } else -1 !== d && (c -= c - d), d = -1;
  } else for (c + k > h && (c = h - k); 0 <= c; c--) {
    h = !0;

    for (d = 0; d < k; d++) if (f(a, c + d) !== f(b, d)) {
      h = !1;
      break;
    }

    if (h) return c;
  }
  return -1;
}

z.prototype.includes = function (a, b, c) {
  return -1 !== this.indexOf(a, b, c);
};

z.prototype.indexOf = function (a, b, c) {
  return Ta(this, a, b, c, !0);
};

z.prototype.lastIndexOf = function (a, b, c) {
  return Ta(this, a, b, c, !1);
};

z.prototype.write = function (a, b, c, d) {
  if (void 0 === b) d = "utf8", c = this.length, b = 0;else if (void 0 === c && "string" === typeof b) d = b, c = this.length, b = 0;else if (isFinite(b)) b |= 0, isFinite(c) ? (c |= 0, void 0 === d && (d = "utf8")) : (d = c, c = void 0);else throw Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
  var e = this.length - b;
  if (void 0 === c || c > e) c = e;
  if (0 < a.length && (0 > c || 0 > b) || b > this.length) throw new RangeError("Attempt to write outside buffer bounds");
  d || (d = "utf8");

  for (e = !1;;) switch (d) {
    case "hex":
      a: {
        b = Number(b) || 0;
        d = this.length - b;
        c ? (c = Number(c), c > d && (c = d)) : c = d;
        d = a.length;
        if (0 !== d % 2) throw new TypeError("Invalid hex string");
        c > d / 2 && (c = d / 2);

        for (d = 0; d < c; ++d) {
          e = parseInt(a.substr(2 * d, 2), 16);

          if (isNaN(e)) {
            a = d;
            break a;
          }

          this[b + d] = e;
        }

        a = d;
      }

      return a;

    case "utf8":
    case "utf-8":
      return Va(Oa(a, this.length - b), this, b, c);

    case "ascii":
      return Va(Wa(a), this, b, c);

    case "latin1":
    case "binary":
      return Va(Wa(a), this, b, c);

    case "base64":
      return Va(Pa(a), this, b, c);

    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      d = a;
      e = this.length - b;

      for (var f = [], g = 0; g < d.length && !(0 > (e -= 2)); ++g) {
        var h = d.charCodeAt(g);
        a = h >> 8;
        h %= 256;
        f.push(h);
        f.push(a);
      }

      return Va(f, this, b, c);

    default:
      if (e) throw new TypeError("Unknown encoding: " + d);
      d = ("" + d).toLowerCase();
      e = !0;
  }
};

z.prototype.toJSON = function () {
  return {
    type: "Buffer",
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function Ra(a, b, c) {
  c = Math.min(a.length, c);

  for (var d = []; b < c;) {
    var e = a[b],
        f = null,
        g = 239 < e ? 4 : 223 < e ? 3 : 191 < e ? 2 : 1;
    if (b + g <= c) switch (g) {
      case 1:
        128 > e && (f = e);
        break;

      case 2:
        var h = a[b + 1];
        128 === (h & 192) && (e = (e & 31) << 6 | h & 63, 127 < e && (f = e));
        break;

      case 3:
        h = a[b + 1];
        var k = a[b + 2];
        128 === (h & 192) && 128 === (k & 192) && (e = (e & 15) << 12 | (h & 63) << 6 | k & 63, 2047 < e && (55296 > e || 57343 < e) && (f = e));
        break;

      case 4:
        h = a[b + 1];
        k = a[b + 2];
        var p = a[b + 3];
        128 === (h & 192) && 128 === (k & 192) && 128 === (p & 192) && (e = (e & 15) << 18 | (h & 63) << 12 | (k & 63) << 6 | p & 63, 65535 < e && 1114112 > e && (f = e));
    }
    null === f ? (f = 65533, g = 1) : 65535 < f && (f -= 65536, d.push(f >>> 10 & 1023 | 55296), f = 56320 | f & 1023);
    d.push(f);
    b += g;
  }

  a = d.length;
  if (a <= ab) d = String.fromCharCode.apply(String, d);else {
    c = "";

    for (b = 0; b < a;) c += String.fromCharCode.apply(String, d.slice(b, b += ab));

    d = c;
  }
  return d;
}

var ab = 4096;

z.prototype.slice = function (a, b) {
  var c = this.length;
  a = ~~a;
  b = void 0 === b ? c : ~~b;
  0 > a ? (a += c, 0 > a && (a = 0)) : a > c && (a = c);
  0 > b ? (b += c, 0 > b && (b = 0)) : b > c && (b = c);
  b < a && (b = a);
  if (z.TYPED_ARRAY_SUPPORT) b = this.subarray(a, b), b.__proto__ = z.prototype;else {
    c = b - a;
    b = new z(c, void 0);

    for (var d = 0; d < c; ++d) b[d] = this[d + a];
  }
  return b;
};

function C(a, b, c) {
  if (0 !== a % 1 || 0 > a) throw new RangeError("offset is not uint");
  if (a + b > c) throw new RangeError("Trying to access beyond buffer length");
}

z.prototype.readUIntLE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = this[a];

  for (var d = 1, e = 0; ++e < b && (d *= 256);) c += this[a + e] * d;

  return c;
};

z.prototype.readUIntBE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = this[a + --b];

  for (var d = 1; 0 < b && (d *= 256);) c += this[a + --b] * d;

  return c;
};

z.prototype.readUInt8 = function (a, b) {
  b || C(a, 1, this.length);
  return this[a];
};

z.prototype.readUInt16LE = function (a, b) {
  b || C(a, 2, this.length);
  return this[a] | this[a + 1] << 8;
};

z.prototype.readUInt16BE = function (a, b) {
  b || C(a, 2, this.length);
  return this[a] << 8 | this[a + 1];
};

z.prototype.readUInt32LE = function (a, b) {
  b || C(a, 4, this.length);
  return (this[a] | this[a + 1] << 8 | this[a + 2] << 16) + 16777216 * this[a + 3];
};

z.prototype.readUInt32BE = function (a, b) {
  b || C(a, 4, this.length);
  return 16777216 * this[a] + (this[a + 1] << 16 | this[a + 2] << 8 | this[a + 3]);
};

z.prototype.readIntLE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = this[a];

  for (var d = 1, e = 0; ++e < b && (d *= 256);) c += this[a + e] * d;

  c >= 128 * d && (c -= Math.pow(2, 8 * b));
  return c;
};

z.prototype.readIntBE = function (a, b, c) {
  a |= 0;
  b |= 0;
  c || C(a, b, this.length);
  c = b;

  for (var d = 1, e = this[a + --c]; 0 < c && (d *= 256);) e += this[a + --c] * d;

  e >= 128 * d && (e -= Math.pow(2, 8 * b));
  return e;
};

z.prototype.readInt8 = function (a, b) {
  b || C(a, 1, this.length);
  return this[a] & 128 ? -1 * (255 - this[a] + 1) : this[a];
};

z.prototype.readInt16LE = function (a, b) {
  b || C(a, 2, this.length);
  a = this[a] | this[a + 1] << 8;
  return a & 32768 ? a | 4294901760 : a;
};

z.prototype.readInt16BE = function (a, b) {
  b || C(a, 2, this.length);
  a = this[a + 1] | this[a] << 8;
  return a & 32768 ? a | 4294901760 : a;
};

z.prototype.readInt32LE = function (a, b) {
  b || C(a, 4, this.length);
  return this[a] | this[a + 1] << 8 | this[a + 2] << 16 | this[a + 3] << 24;
};

z.prototype.readInt32BE = function (a, b) {
  b || C(a, 4, this.length);
  return this[a] << 24 | this[a + 1] << 16 | this[a + 2] << 8 | this[a + 3];
};

z.prototype.readFloatLE = function (a, b) {
  b || C(a, 4, this.length);
  return sa(this, a, !0, 23, 4);
};

z.prototype.readFloatBE = function (a, b) {
  b || C(a, 4, this.length);
  return sa(this, a, !1, 23, 4);
};

z.prototype.readDoubleLE = function (a, b) {
  b || C(a, 8, this.length);
  return sa(this, a, !0, 52, 8);
};

z.prototype.readDoubleBE = function (a, b) {
  b || C(a, 8, this.length);
  return sa(this, a, !1, 52, 8);
};

function E(a, b, c, d, e, f) {
  if (!A(a)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (b > e || b < f) throw new RangeError('"value" argument is out of bounds');
  if (c + d > a.length) throw new RangeError("Index out of range");
}

z.prototype.writeUIntLE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  c |= 0;
  d || E(this, a, b, c, Math.pow(2, 8 * c) - 1, 0);
  d = 1;
  var e = 0;

  for (this[b] = a & 255; ++e < c && (d *= 256);) this[b + e] = a / d & 255;

  return b + c;
};

z.prototype.writeUIntBE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  c |= 0;
  d || E(this, a, b, c, Math.pow(2, 8 * c) - 1, 0);
  d = c - 1;
  var e = 1;

  for (this[b + d] = a & 255; 0 <= --d && (e *= 256);) this[b + d] = a / e & 255;

  return b + c;
};

z.prototype.writeUInt8 = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 1, 255, 0);
  z.TYPED_ARRAY_SUPPORT || (a = Math.floor(a));
  this[b] = a & 255;
  return b + 1;
};

function bb(a, b, c, d) {
  0 > b && (b = 65535 + b + 1);

  for (var e = 0, f = Math.min(a.length - c, 2); e < f; ++e) a[c + e] = (b & 255 << 8 * (d ? e : 1 - e)) >>> 8 * (d ? e : 1 - e);
}

z.prototype.writeUInt16LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 2, 65535, 0);
  z.TYPED_ARRAY_SUPPORT ? (this[b] = a & 255, this[b + 1] = a >>> 8) : bb(this, a, b, !0);
  return b + 2;
};

z.prototype.writeUInt16BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 2, 65535, 0);
  z.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 8, this[b + 1] = a & 255) : bb(this, a, b, !1);
  return b + 2;
};

function cb(a, b, c, d) {
  0 > b && (b = 4294967295 + b + 1);

  for (var e = 0, f = Math.min(a.length - c, 4); e < f; ++e) a[c + e] = b >>> 8 * (d ? e : 3 - e) & 255;
}

z.prototype.writeUInt32LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 4, 4294967295, 0);
  z.TYPED_ARRAY_SUPPORT ? (this[b + 3] = a >>> 24, this[b + 2] = a >>> 16, this[b + 1] = a >>> 8, this[b] = a & 255) : cb(this, a, b, !0);
  return b + 4;
};

z.prototype.writeUInt32BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 4, 4294967295, 0);
  z.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 24, this[b + 1] = a >>> 16, this[b + 2] = a >>> 8, this[b + 3] = a & 255) : cb(this, a, b, !1);
  return b + 4;
};

z.prototype.writeIntLE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  d || (d = Math.pow(2, 8 * c - 1), E(this, a, b, c, d - 1, -d));
  d = 0;
  var e = 1,
      f = 0;

  for (this[b] = a & 255; ++d < c && (e *= 256);) 0 > a && 0 === f && 0 !== this[b + d - 1] && (f = 1), this[b + d] = (a / e >> 0) - f & 255;

  return b + c;
};

z.prototype.writeIntBE = function (a, b, c, d) {
  a = +a;
  b |= 0;
  d || (d = Math.pow(2, 8 * c - 1), E(this, a, b, c, d - 1, -d));
  d = c - 1;
  var e = 1,
      f = 0;

  for (this[b + d] = a & 255; 0 <= --d && (e *= 256);) 0 > a && 0 === f && 0 !== this[b + d + 1] && (f = 1), this[b + d] = (a / e >> 0) - f & 255;

  return b + c;
};

z.prototype.writeInt8 = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 1, 127, -128);
  z.TYPED_ARRAY_SUPPORT || (a = Math.floor(a));
  0 > a && (a = 255 + a + 1);
  this[b] = a & 255;
  return b + 1;
};

z.prototype.writeInt16LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 2, 32767, -32768);
  z.TYPED_ARRAY_SUPPORT ? (this[b] = a & 255, this[b + 1] = a >>> 8) : bb(this, a, b, !0);
  return b + 2;
};

z.prototype.writeInt16BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 2, 32767, -32768);
  z.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 8, this[b + 1] = a & 255) : bb(this, a, b, !1);
  return b + 2;
};

z.prototype.writeInt32LE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 4, 2147483647, -2147483648);
  z.TYPED_ARRAY_SUPPORT ? (this[b] = a & 255, this[b + 1] = a >>> 8, this[b + 2] = a >>> 16, this[b + 3] = a >>> 24) : cb(this, a, b, !0);
  return b + 4;
};

z.prototype.writeInt32BE = function (a, b, c) {
  a = +a;
  b |= 0;
  c || E(this, a, b, 4, 2147483647, -2147483648);
  0 > a && (a = 4294967295 + a + 1);
  z.TYPED_ARRAY_SUPPORT ? (this[b] = a >>> 24, this[b + 1] = a >>> 16, this[b + 2] = a >>> 8, this[b + 3] = a & 255) : cb(this, a, b, !1);
  return b + 4;
};

function db(a, b, c, d) {
  if (c + d > a.length) throw new RangeError("Index out of range");
  if (0 > c) throw new RangeError("Index out of range");
}

z.prototype.writeFloatLE = function (a, b, c) {
  c || db(this, a, b, 4);
  ta(this, a, b, !0, 23, 4);
  return b + 4;
};

z.prototype.writeFloatBE = function (a, b, c) {
  c || db(this, a, b, 4);
  ta(this, a, b, !1, 23, 4);
  return b + 4;
};

z.prototype.writeDoubleLE = function (a, b, c) {
  c || db(this, a, b, 8);
  ta(this, a, b, !0, 52, 8);
  return b + 8;
};

z.prototype.writeDoubleBE = function (a, b, c) {
  c || db(this, a, b, 8);
  ta(this, a, b, !1, 52, 8);
  return b + 8;
};

z.prototype.copy = function (a, b, c, d) {
  c || (c = 0);
  d || 0 === d || (d = this.length);
  b >= a.length && (b = a.length);
  b || (b = 0);
  0 < d && d < c && (d = c);
  if (d === c || 0 === a.length || 0 === this.length) return 0;
  if (0 > b) throw new RangeError("targetStart out of bounds");
  if (0 > c || c >= this.length) throw new RangeError("sourceStart out of bounds");
  if (0 > d) throw new RangeError("sourceEnd out of bounds");
  d > this.length && (d = this.length);
  a.length - b < d - c && (d = a.length - b + c);
  var e = d - c;
  if (this === a && c < b && b < d) for (d = e - 1; 0 <= d; --d) a[d + b] = this[d + c];else if (1E3 > e || !z.TYPED_ARRAY_SUPPORT) for (d = 0; d < e; ++d) a[d + b] = this[d + c];else Uint8Array.prototype.set.call(a, this.subarray(c, c + e), b);
  return e;
};

z.prototype.fill = function (a, b, c, d) {
  if ("string" === typeof a) {
    "string" === typeof b ? (d = b, b = 0, c = this.length) : "string" === typeof c && (d = c, c = this.length);

    if (1 === a.length) {
      var e = a.charCodeAt(0);
      256 > e && (a = e);
    }

    if (void 0 !== d && "string" !== typeof d) throw new TypeError("encoding must be a string");
    if ("string" === typeof d && !z.isEncoding(d)) throw new TypeError("Unknown encoding: " + d);
  } else "number" === typeof a && (a &= 255);

  if (0 > b || this.length < b || this.length < c) throw new RangeError("Out of range index");
  if (c <= b) return this;
  b >>>= 0;
  c = void 0 === c ? this.length : c >>> 0;
  a || (a = 0);
  if ("number" === typeof a) for (d = b; d < c; ++d) this[d] = a;else for (a = A(a) ? a : Oa(new z(a, d).toString()), e = a.length, d = 0; d < c - b; ++d) this[d + b] = a[d % e];
  return this;
};

var eb = /[^+\/0-9A-Za-z-_]/g;

function Oa(a, b) {
  b = b || Infinity;

  for (var c, d = a.length, e = null, f = [], g = 0; g < d; ++g) {
    c = a.charCodeAt(g);

    if (55295 < c && 57344 > c) {
      if (!e) {
        if (56319 < c) {
          -1 < (b -= 3) && f.push(239, 191, 189);
          continue;
        } else if (g + 1 === d) {
          -1 < (b -= 3) && f.push(239, 191, 189);
          continue;
        }

        e = c;
        continue;
      }

      if (56320 > c) {
        -1 < (b -= 3) && f.push(239, 191, 189);
        e = c;
        continue;
      }

      c = (e - 55296 << 10 | c - 56320) + 65536;
    } else e && -1 < (b -= 3) && f.push(239, 191, 189);

    e = null;

    if (128 > c) {
      if (0 > --b) break;
      f.push(c);
    } else if (2048 > c) {
      if (0 > (b -= 2)) break;
      f.push(c >> 6 | 192, c & 63 | 128);
    } else if (65536 > c) {
      if (0 > (b -= 3)) break;
      f.push(c >> 12 | 224, c >> 6 & 63 | 128, c & 63 | 128);
    } else if (1114112 > c) {
      if (0 > (b -= 4)) break;
      f.push(c >> 18 | 240, c >> 12 & 63 | 128, c >> 6 & 63 | 128, c & 63 | 128);
    } else throw Error("Invalid code point");
  }

  return f;
}

function Wa(a) {
  for (var b = [], c = 0; c < a.length; ++c) b.push(a.charCodeAt(c) & 255);

  return b;
}

function Pa(a) {
  a = (a.trim ? a.trim() : a.replace(/^\s+|\s+$/g, "")).replace(eb, "");
  if (2 > a.length) a = "";else for (; 0 !== a.length % 4;) a += "=";
  oa || pa();
  var b = a.length;
  if (0 < b % 4) throw Error("Invalid string. Length must be a multiple of 4");
  var c = "=" === a[b - 2] ? 2 : "=" === a[b - 1] ? 1 : 0;
  var d = new ma(3 * b / 4 - c);
  var e = 0 < c ? b - 4 : b;
  var f = 0;

  for (b = 0; b < e; b += 4) {
    var g = y[a.charCodeAt(b)] << 18 | y[a.charCodeAt(b + 1)] << 12 | y[a.charCodeAt(b + 2)] << 6 | y[a.charCodeAt(b + 3)];
    d[f++] = g >> 16 & 255;
    d[f++] = g >> 8 & 255;
    d[f++] = g & 255;
  }

  2 === c ? (g = y[a.charCodeAt(b)] << 2 | y[a.charCodeAt(b + 1)] >> 4, d[f++] = g & 255) : 1 === c && (g = y[a.charCodeAt(b)] << 10 | y[a.charCodeAt(b + 1)] << 4 | y[a.charCodeAt(b + 2)] >> 2, d[f++] = g >> 8 & 255, d[f++] = g & 255);
  return d;
}

function Va(a, b, c, d) {
  for (var e = 0; e < d && !(e + c >= b.length || e >= a.length); ++e) b[e + c] = a[e];

  return e;
}

function Na(a) {
  return null != a && (!!a._isBuffer || fb(a) || "function" === typeof a.readFloatLE && "function" === typeof a.slice && fb(a.slice(0, 0)));
}

function fb(a) {
  return !!a.constructor && "function" === typeof a.constructor.isBuffer && a.constructor.isBuffer(a);
}

var gb = Object.freeze({
  __proto__: null,
  INSPECT_MAX_BYTES: 50,
  kMaxLength: za,
  Buffer: z,
  SlowBuffer: function (a) {
    +a != a && (a = 0);
    return z.alloc(+a);
  },
  isBuffer: Na
}),
    F = u(function (a, b) {
  function c(a) {
    for (var b = [], c = 1; c < arguments.length; c++) b[c - 1] = arguments[c];

    return new (gb.Buffer.bind.apply(gb.Buffer, d([void 0, a], b)))();
  }

  var d = l && l.__spreadArrays || function () {
    for (var a = 0, b = 0, c = arguments.length; b < c; b++) a += arguments[b].length;

    a = Array(a);
    var d = 0;

    for (b = 0; b < c; b++) for (var k = arguments[b], p = 0, n = k.length; p < n; p++, d++) a[d] = k[p];

    return a;
  };

  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  b.Buffer = gb.Buffer;
  b.bufferAllocUnsafe = gb.Buffer.allocUnsafe || c;
  b.bufferFrom = gb.Buffer.from || c;
});
t(F);

function hb() {
  throw Error("setTimeout has not been defined");
}

function ib() {
  throw Error("clearTimeout has not been defined");
}

var jb = hb,
    kb = ib;
"function" === typeof la.setTimeout && (jb = setTimeout);
"function" === typeof la.clearTimeout && (kb = clearTimeout);

function pb(a) {
  if (jb === setTimeout) return setTimeout(a, 0);
  if ((jb === hb || !jb) && setTimeout) return jb = setTimeout, setTimeout(a, 0);

  try {
    return jb(a, 0);
  } catch (b) {
    try {
      return jb.call(null, a, 0);
    } catch (c) {
      return jb.call(this, a, 0);
    }
  }
}

function rb(a) {
  if (kb === clearTimeout) return clearTimeout(a);
  if ((kb === ib || !kb) && clearTimeout) return kb = clearTimeout, clearTimeout(a);

  try {
    return kb(a);
  } catch (b) {
    try {
      return kb.call(null, a);
    } catch (c) {
      return kb.call(this, a);
    }
  }
}

var sb = [],
    tb = !1,
    ub,
    vb = -1;

function wb() {
  tb && ub && (tb = !1, ub.length ? sb = ub.concat(sb) : vb = -1, sb.length && xb());
}

function xb() {
  if (!tb) {
    var a = pb(wb);
    tb = !0;

    for (var b = sb.length; b;) {
      ub = sb;

      for (sb = []; ++vb < b;) ub && ub[vb].run();

      vb = -1;
      b = sb.length;
    }

    ub = null;
    tb = !1;
    rb(a);
  }
}

function G(a) {
  var b = Array(arguments.length - 1);
  if (1 < arguments.length) for (var c = 1; c < arguments.length; c++) b[c - 1] = arguments[c];
  sb.push(new yb(a, b));
  1 !== sb.length || tb || pb(xb);
}

function yb(a, b) {
  this.fun = a;
  this.array = b;
}

yb.prototype.run = function () {
  this.fun.apply(null, this.array);
};

function zb() {}

var performance = la.performance || {},
    Ab = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
  return new Date().getTime();
},
    Bb = new Date(),
    Cb = {
  nextTick: G,
  title: "browser",
  browser: !0,
  env: {},
  argv: [],
  version: "",
  versions: {},
  on: zb,
  addListener: zb,
  once: zb,
  off: zb,
  removeListener: zb,
  removeAllListeners: zb,
  emit: zb,
  binding: function () {
    throw Error("process.binding is not supported");
  },
  cwd: function () {
    return "/";
  },
  chdir: function () {
    throw Error("process.chdir is not supported");
  },
  umask: function () {
    return 0;
  },
  hrtime: function (a) {
    var b = .001 * Ab.call(performance),
        c = Math.floor(b);
    b = Math.floor(b % 1 * 1E9);
    a && (c -= a[0], b -= a[1], 0 > b && (c--, b += 1E9));
    return [c, b];
  },
  platform: "browser",
  release: {},
  config: {},
  uptime: function () {
    return (new Date() - Bb) / 1E3;
  }
},
    Db = "function" === typeof Object.create ? function (a, b) {
  a.super_ = b;
  a.prototype = Object.create(b.prototype, {
    constructor: {
      value: a,
      enumerable: !1,
      writable: !0,
      configurable: !0
    }
  });
} : function (a, b) {
  function c() {}

  a.super_ = b;
  c.prototype = b.prototype;
  a.prototype = new c();
  a.prototype.constructor = a;
},
    Eb = /%[sdj%]/g;

function Fb(a) {
  if (!Gb(a)) {
    for (var b = [], c = 0; c < arguments.length; c++) b.push(H(arguments[c]));

    return b.join(" ");
  }

  c = 1;
  var d = arguments,
      e = d.length;
  b = String(a).replace(Eb, function (a) {
    if ("%%" === a) return "%";
    if (c >= e) return a;

    switch (a) {
      case "%s":
        return String(d[c++]);

      case "%d":
        return Number(d[c++]);

      case "%j":
        try {
          return JSON.stringify(d[c++]);
        } catch (h) {
          return "[Circular]";
        }

      default:
        return a;
    }
  });

  for (var f = d[c]; c < e; f = d[++c]) b = null !== f && Hb(f) ? b + (" " + H(f)) : b + (" " + f);

  return b;
}

function Ib(a, b) {
  if (Jb(la.process)) return function () {
    return Ib(a, b).apply(this, arguments);
  };
  if (!0 === Cb.noDeprecation) return a;
  var c = !1;
  return function () {
    if (!c) {
      if (Cb.throwDeprecation) throw Error(b);
      Cb.traceDeprecation ? console.trace(b) : console.error(b);
      c = !0;
    }

    return a.apply(this, arguments);
  };
}

var Kb = {},
    Lb;

function Mb(a) {
  Jb(Lb) && (Lb = Cb.env.NODE_DEBUG || "");
  a = a.toUpperCase();
  Kb[a] || (new RegExp("\\b" + a + "\\b", "i").test(Lb) ? Kb[a] = function () {
    var b = Fb.apply(null, arguments);
    console.error("%s %d: %s", a, 0, b);
  } : Kb[a] = function () {});
  return Kb[a];
}

function H(a, b) {
  var c = {
    seen: [],
    stylize: Nb
  };
  3 <= arguments.length && (c.depth = arguments[2]);
  4 <= arguments.length && (c.colors = arguments[3]);
  Ob(b) ? c.showHidden = b : b && Pb(c, b);
  Jb(c.showHidden) && (c.showHidden = !1);
  Jb(c.depth) && (c.depth = 2);
  Jb(c.colors) && (c.colors = !1);
  Jb(c.customInspect) && (c.customInspect = !0);
  c.colors && (c.stylize = Qb);
  return Rb(c, a, c.depth);
}

H.colors = {
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  white: [37, 39],
  grey: [90, 39],
  black: [30, 39],
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [31, 39],
  yellow: [33, 39]
};
H.styles = {
  special: "cyan",
  number: "yellow",
  "boolean": "yellow",
  undefined: "grey",
  "null": "bold",
  string: "green",
  date: "magenta",
  regexp: "red"
};

function Qb(a, b) {
  return (b = H.styles[b]) ? "\u001b[" + H.colors[b][0] + "m" + a + "\u001b[" + H.colors[b][1] + "m" : a;
}

function Nb(a) {
  return a;
}

function Sb(a) {
  var b = {};
  a.forEach(function (a) {
    b[a] = !0;
  });
  return b;
}

function Rb(a, b, c) {
  if (a.customInspect && b && Tb(b.inspect) && b.inspect !== H && (!b.constructor || b.constructor.prototype !== b)) {
    var d = b.inspect(c, a);
    Gb(d) || (d = Rb(a, d, c));
    return d;
  }

  if (d = Ub(a, b)) return d;
  var e = Object.keys(b),
      f = Sb(e);
  a.showHidden && (e = Object.getOwnPropertyNames(b));
  if (Vb(b) && (0 <= e.indexOf("message") || 0 <= e.indexOf("description"))) return Zb(b);

  if (0 === e.length) {
    if (Tb(b)) return a.stylize("[Function" + (b.name ? ": " + b.name : "") + "]", "special");
    if (ac(b)) return a.stylize(RegExp.prototype.toString.call(b), "regexp");
    if (bc(b)) return a.stylize(Date.prototype.toString.call(b), "date");
    if (Vb(b)) return Zb(b);
  }

  d = "";
  var g = !1,
      h = ["{", "}"];
  cc(b) && (g = !0, h = ["[", "]"]);
  Tb(b) && (d = " [Function" + (b.name ? ": " + b.name : "") + "]");
  ac(b) && (d = " " + RegExp.prototype.toString.call(b));
  bc(b) && (d = " " + Date.prototype.toUTCString.call(b));
  Vb(b) && (d = " " + Zb(b));
  if (0 === e.length && (!g || 0 == b.length)) return h[0] + d + h[1];
  if (0 > c) return ac(b) ? a.stylize(RegExp.prototype.toString.call(b), "regexp") : a.stylize("[Object]", "special");
  a.seen.push(b);
  e = g ? dc(a, b, c, f, e) : e.map(function (d) {
    return ec(a, b, c, f, d, g);
  });
  a.seen.pop();
  return fc(e, d, h);
}

function Ub(a, b) {
  if (Jb(b)) return a.stylize("undefined", "undefined");
  if (Gb(b)) return b = "'" + JSON.stringify(b).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'", a.stylize(b, "string");
  if (gc(b)) return a.stylize("" + b, "number");
  if (Ob(b)) return a.stylize("" + b, "boolean");
  if (null === b) return a.stylize("null", "null");
}

function Zb(a) {
  return "[" + Error.prototype.toString.call(a) + "]";
}

function dc(a, b, c, d, e) {
  for (var f = [], g = 0, h = b.length; g < h; ++g) Object.prototype.hasOwnProperty.call(b, String(g)) ? f.push(ec(a, b, c, d, String(g), !0)) : f.push("");

  e.forEach(function (e) {
    e.match(/^\d+$/) || f.push(ec(a, b, c, d, e, !0));
  });
  return f;
}

function ec(a, b, c, d, e, f) {
  var g, h;
  b = Object.getOwnPropertyDescriptor(b, e) || {
    value: b[e]
  };
  b.get ? h = b.set ? a.stylize("[Getter/Setter]", "special") : a.stylize("[Getter]", "special") : b.set && (h = a.stylize("[Setter]", "special"));
  Object.prototype.hasOwnProperty.call(d, e) || (g = "[" + e + "]");
  h || (0 > a.seen.indexOf(b.value) ? (h = null === c ? Rb(a, b.value, null) : Rb(a, b.value, c - 1), -1 < h.indexOf("\n") && (h = f ? h.split("\n").map(function (a) {
    return "  " + a;
  }).join("\n").substr(2) : "\n" + h.split("\n").map(function (a) {
    return "   " + a;
  }).join("\n"))) : h = a.stylize("[Circular]", "special"));

  if (Jb(g)) {
    if (f && e.match(/^\d+$/)) return h;
    g = JSON.stringify("" + e);
    g.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (g = g.substr(1, g.length - 2), g = a.stylize(g, "name")) : (g = g.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), g = a.stylize(g, "string"));
  }

  return g + ": " + h;
}

function fc(a, b, c) {
  return 60 < a.reduce(function (a, b) {
    b.indexOf("\n");
    return a + b.replace(/\u001b\[\d\d?m/g, "").length + 1;
  }, 0) ? c[0] + ("" === b ? "" : b + "\n ") + " " + a.join(",\n  ") + " " + c[1] : c[0] + b + " " + a.join(", ") + " " + c[1];
}

function cc(a) {
  return Array.isArray(a);
}

function Ob(a) {
  return "boolean" === typeof a;
}

function gc(a) {
  return "number" === typeof a;
}

function Gb(a) {
  return "string" === typeof a;
}

function Jb(a) {
  return void 0 === a;
}

function ac(a) {
  return Hb(a) && "[object RegExp]" === Object.prototype.toString.call(a);
}

function Hb(a) {
  return "object" === typeof a && null !== a;
}

function bc(a) {
  return Hb(a) && "[object Date]" === Object.prototype.toString.call(a);
}

function Vb(a) {
  return Hb(a) && ("[object Error]" === Object.prototype.toString.call(a) || a instanceof Error);
}

function Tb(a) {
  return "function" === typeof a;
}

function hc(a) {
  return null === a || "boolean" === typeof a || "number" === typeof a || "string" === typeof a || "symbol" === typeof a || "undefined" === typeof a;
}

function ic(a) {
  return 10 > a ? "0" + a.toString(10) : a.toString(10);
}

var jc = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

function kc() {
  var a = new Date(),
      b = [ic(a.getHours()), ic(a.getMinutes()), ic(a.getSeconds())].join(":");
  return [a.getDate(), jc[a.getMonth()], b].join(" ");
}

function Pb(a, b) {
  if (!b || !Hb(b)) return a;

  for (var c = Object.keys(b), d = c.length; d--;) a[c[d]] = b[c[d]];

  return a;
}

var lc = {
  inherits: Db,
  _extend: Pb,
  log: function () {
    console.log("%s - %s", kc(), Fb.apply(null, arguments));
  },
  isBuffer: function (a) {
    return Na(a);
  },
  isPrimitive: hc,
  isFunction: Tb,
  isError: Vb,
  isDate: bc,
  isObject: Hb,
  isRegExp: ac,
  isUndefined: Jb,
  isSymbol: function (a) {
    return "symbol" === typeof a;
  },
  isString: Gb,
  isNumber: gc,
  isNullOrUndefined: function (a) {
    return null == a;
  },
  isNull: function (a) {
    return null === a;
  },
  isBoolean: Ob,
  isArray: cc,
  inspect: H,
  deprecate: Ib,
  format: Fb,
  debuglog: Mb
};

function mc(a, b) {
  if (a === b) return 0;

  for (var c = a.length, d = b.length, e = 0, f = Math.min(c, d); e < f; ++e) if (a[e] !== b[e]) {
    c = a[e];
    d = b[e];
    break;
  }

  return c < d ? -1 : d < c ? 1 : 0;
}

var nc = Object.prototype.hasOwnProperty,
    oc = Object.keys || function (a) {
  var b = [],
      c;

  for (c in a) nc.call(a, c) && b.push(c);

  return b;
},
    pc = Array.prototype.slice,
    qc;

function rc() {
  return "undefined" !== typeof qc ? qc : qc = function () {
    return "foo" === function () {}.name;
  }();
}

function sc(a) {
  return Na(a) || "function" !== typeof la.ArrayBuffer ? !1 : "function" === typeof ArrayBuffer.isView ? ArrayBuffer.isView(a) : a ? a instanceof DataView || a.buffer && a.buffer instanceof ArrayBuffer ? !0 : !1 : !1;
}

function I(a, b) {
  a || J(a, !0, b, "==", tc);
}

var uc = /\s*function\s+([^\(\s]*)\s*/;

function vc(a) {
  if (Tb(a)) return rc() ? a.name : (a = a.toString().match(uc)) && a[1];
}

I.AssertionError = wc;

function wc(a) {
  this.name = "AssertionError";
  this.actual = a.actual;
  this.expected = a.expected;
  this.operator = a.operator;
  a.message ? (this.message = a.message, this.generatedMessage = !1) : (this.message = xc(yc(this.actual), 128) + " " + this.operator + " " + xc(yc(this.expected), 128), this.generatedMessage = !0);
  var b = a.stackStartFunction || J;
  Error.captureStackTrace ? Error.captureStackTrace(this, b) : (a = Error(), a.stack && (a = a.stack, b = vc(b), b = a.indexOf("\n" + b), 0 <= b && (b = a.indexOf("\n", b + 1), a = a.substring(b + 1)), this.stack = a));
}

Db(wc, Error);

function xc(a, b) {
  return "string" === typeof a ? a.length < b ? a : a.slice(0, b) : a;
}

function yc(a) {
  if (rc() || !Tb(a)) return H(a);
  a = vc(a);
  return "[Function" + (a ? ": " + a : "") + "]";
}

function J(a, b, c, d, e) {
  throw new wc({
    message: c,
    actual: a,
    expected: b,
    operator: d,
    stackStartFunction: e
  });
}

I.fail = J;

function tc(a, b) {
  a || J(a, !0, b, "==", tc);
}

I.ok = tc;
I.equal = zc;

function zc(a, b, c) {
  a != b && J(a, b, c, "==", zc);
}

I.notEqual = Ac;

function Ac(a, b, c) {
  a == b && J(a, b, c, "!=", Ac);
}

I.deepEqual = Bc;

function Bc(a, b, c) {
  Cc(a, b, !1) || J(a, b, c, "deepEqual", Bc);
}

I.deepStrictEqual = Dc;

function Dc(a, b, c) {
  Cc(a, b, !0) || J(a, b, c, "deepStrictEqual", Dc);
}

function Cc(a, b, c, d) {
  if (a === b) return !0;
  if (Na(a) && Na(b)) return 0 === mc(a, b);
  if (bc(a) && bc(b)) return a.getTime() === b.getTime();
  if (ac(a) && ac(b)) return a.source === b.source && a.global === b.global && a.multiline === b.multiline && a.lastIndex === b.lastIndex && a.ignoreCase === b.ignoreCase;

  if (null !== a && "object" === typeof a || null !== b && "object" === typeof b) {
    if (!sc(a) || !sc(b) || Object.prototype.toString.call(a) !== Object.prototype.toString.call(b) || a instanceof Float32Array || a instanceof Float64Array) {
      if (Na(a) !== Na(b)) return !1;
      d = d || {
        actual: [],
        expected: []
      };
      var e = d.actual.indexOf(a);
      if (-1 !== e && e === d.expected.indexOf(b)) return !0;
      d.actual.push(a);
      d.expected.push(b);
      return Ec(a, b, c, d);
    }

    return 0 === mc(new Uint8Array(a.buffer), new Uint8Array(b.buffer));
  }

  return c ? a === b : a == b;
}

function Fc(a) {
  return "[object Arguments]" == Object.prototype.toString.call(a);
}

function Ec(a, b, c, d) {
  if (null === a || void 0 === a || null === b || void 0 === b) return !1;
  if (hc(a) || hc(b)) return a === b;
  if (c && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return !1;
  var e = Fc(a),
      f = Fc(b);
  if (e && !f || !e && f) return !1;
  if (e) return a = pc.call(a), b = pc.call(b), Cc(a, b, c);
  e = oc(a);
  var g = oc(b);
  if (e.length !== g.length) return !1;
  e.sort();
  g.sort();

  for (f = e.length - 1; 0 <= f; f--) if (e[f] !== g[f]) return !1;

  for (f = e.length - 1; 0 <= f; f--) if (g = e[f], !Cc(a[g], b[g], c, d)) return !1;

  return !0;
}

I.notDeepEqual = Gc;

function Gc(a, b, c) {
  Cc(a, b, !1) && J(a, b, c, "notDeepEqual", Gc);
}

I.notDeepStrictEqual = Hc;

function Hc(a, b, c) {
  Cc(a, b, !0) && J(a, b, c, "notDeepStrictEqual", Hc);
}

I.strictEqual = Ic;

function Ic(a, b, c) {
  a !== b && J(a, b, c, "===", Ic);
}

I.notStrictEqual = Jc;

function Jc(a, b, c) {
  a === b && J(a, b, c, "!==", Jc);
}

function Kc(a, b) {
  if (!a || !b) return !1;
  if ("[object RegExp]" == Object.prototype.toString.call(b)) return b.test(a);

  try {
    if (a instanceof b) return !0;
  } catch (c) {}

  return Error.isPrototypeOf(b) ? !1 : !0 === b.call({}, a);
}

function Lc(a, b, c, d) {
  if ("function" !== typeof b) throw new TypeError('"block" argument must be a function');
  "string" === typeof c && (d = c, c = null);

  try {
    b();
  } catch (h) {
    var e = h;
  }

  b = e;
  d = (c && c.name ? " (" + c.name + ")." : ".") + (d ? " " + d : ".");
  a && !b && J(b, c, "Missing expected exception" + d);
  e = "string" === typeof d;
  var f = !a && Vb(b),
      g = !a && b && !c;
  (f && e && Kc(b, c) || g) && J(b, c, "Got unwanted exception" + d);
  if (a && b && c && !Kc(b, c) || !a && b) throw b;
}

I.throws = Mc;

function Mc(a, b, c) {
  Lc(!0, a, b, c);
}

I.doesNotThrow = Nc;

function Nc(a, b, c) {
  Lc(!1, a, b, c);
}

I.ifError = Oc;

function Oc(a) {
  if (a) throw a;
}

var Pc = u(function (a, b) {
  function c(a) {
    return function (a) {
      function b(b) {
        for (var c = [], e = 1; e < arguments.length; e++) c[e - 1] = arguments[e];

        c = a.call(this, d(b, c)) || this;
        c.code = b;
        c[h] = b;
        c.name = a.prototype.name + " [" + c[h] + "]";
        return c;
      }

      g(b, a);
      return b;
    }(a);
  }

  function d(a, b) {
    I.strictEqual(typeof a, "string");
    var c = k[a];
    I(c, "An invalid error message key was used: " + a + ".");
    if ("function" === typeof c) a = c;else {
      a = lc.format;
      if (void 0 === b || 0 === b.length) return c;
      b.unshift(c);
    }
    return String(a.apply(null, b));
  }

  function e(a, b) {
    k[a] = "function" === typeof b ? b : String(b);
  }

  function f(a, b) {
    I(a, "expected is required");
    I("string" === typeof b, "thing is required");

    if (Array.isArray(a)) {
      var c = a.length;
      I(0 < c, "At least one expected value needs to be specified");
      a = a.map(function (a) {
        return String(a);
      });
      return 2 < c ? "one of " + b + " " + a.slice(0, c - 1).join(", ") + ", or " + a[c - 1] : 2 === c ? "one of " + b + " " + a[0] + " or " + a[1] : "of " + b + " " + a[0];
    }

    return "of " + b + " " + String(a);
  }

  var g = l && l.__extends || function () {
    function a(b, c) {
      a = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (a, b) {
        a.__proto__ = b;
      } || function (a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
      };

      return a(b, c);
    }

    return function (b, c) {
      function d() {
        this.constructor = b;
      }

      a(b, c);
      b.prototype = null === c ? Object.create(c) : (d.prototype = c.prototype, new d());
    };
  }();

  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  var h = "undefined" === typeof Symbol ? "_kCode" : Symbol("code"),
      k = {};

  a = function (a) {
    function c(c) {
      if ("object" !== typeof c || null === c) throw new b.TypeError("ERR_INVALID_ARG_TYPE", "options", "object");
      var d = c.message ? a.call(this, c.message) || this : a.call(this, lc.inspect(c.actual).slice(0, 128) + " " + (c.operator + " " + lc.inspect(c.expected).slice(0, 128))) || this;
      d.generatedMessage = !c.message;
      d.name = "AssertionError [ERR_ASSERTION]";
      d.code = "ERR_ASSERTION";
      d.actual = c.actual;
      d.expected = c.expected;
      d.operator = c.operator;
      b.Error.captureStackTrace(d, c.stackStartFunction);
      return d;
    }

    g(c, a);
    return c;
  }(l.Error);

  b.AssertionError = a;
  b.message = d;
  b.E = e;
  b.Error = c(l.Error);
  b.TypeError = c(l.TypeError);
  b.RangeError = c(l.RangeError);
  e("ERR_ARG_NOT_ITERABLE", "%s must be iterable");
  e("ERR_ASSERTION", "%s");
  e("ERR_BUFFER_OUT_OF_BOUNDS", function (a, b) {
    return b ? "Attempt to write outside buffer bounds" : '"' + a + '" is outside of buffer bounds';
  });
  e("ERR_CHILD_CLOSED_BEFORE_REPLY", "Child closed before reply received");
  e("ERR_CONSOLE_WRITABLE_STREAM", "Console expects a writable stream instance for %s");
  e("ERR_CPU_USAGE", "Unable to obtain cpu usage %s");
  e("ERR_DNS_SET_SERVERS_FAILED", function (a, b) {
    return 'c-ares failed to set servers: "' + a + '" [' + b + "]";
  });
  e("ERR_FALSY_VALUE_REJECTION", "Promise was rejected with falsy value");
  e("ERR_ENCODING_NOT_SUPPORTED", function (a) {
    return 'The "' + a + '" encoding is not supported';
  });
  e("ERR_ENCODING_INVALID_ENCODED_DATA", function (a) {
    return "The encoded data was not valid for encoding " + a;
  });
  e("ERR_HTTP_HEADERS_SENT", "Cannot render headers after they are sent to the client");
  e("ERR_HTTP_INVALID_STATUS_CODE", "Invalid status code: %s");
  e("ERR_HTTP_TRAILER_INVALID", "Trailers are invalid with this transfer encoding");
  e("ERR_INDEX_OUT_OF_RANGE", "Index out of range");
  e("ERR_INVALID_ARG_TYPE", function (a, b, c) {
    I(a, "name is required");

    if (b.includes("not ")) {
      var d = "must not be";
      b = b.split("not ")[1];
    } else d = "must be";

    if (Array.isArray(a)) d = "The " + a.map(function (a) {
      return '"' + a + '"';
    }).join(", ") + " arguments " + d + " " + f(b, "type");else if (a.includes(" argument")) d = "The " + a + " " + d + " " + f(b, "type");else {
      var e = a.includes(".") ? "property" : "argument";
      d = 'The "' + a + '" ' + e + " " + d + " " + f(b, "type");
    }
    3 <= arguments.length && (d += ". Received type " + (null !== c ? typeof c : "null"));
    return d;
  });
  e("ERR_INVALID_ARRAY_LENGTH", function (a, b, c) {
    I.strictEqual(typeof c, "number");
    return 'The array "' + a + '" (length ' + c + ") must be of length " + b + ".";
  });
  e("ERR_INVALID_BUFFER_SIZE", "Buffer size must be a multiple of %s");
  e("ERR_INVALID_CALLBACK", "Callback must be a function");
  e("ERR_INVALID_CHAR", "Invalid character in %s");
  e("ERR_INVALID_CURSOR_POS", "Cannot set cursor row without setting its column");
  e("ERR_INVALID_FD", '"fd" must be a positive integer: %s');
  e("ERR_INVALID_FILE_URL_HOST", 'File URL host must be "localhost" or empty on %s');
  e("ERR_INVALID_FILE_URL_PATH", "File URL path %s");
  e("ERR_INVALID_HANDLE_TYPE", "This handle type cannot be sent");
  e("ERR_INVALID_IP_ADDRESS", "Invalid IP address: %s");
  e("ERR_INVALID_OPT_VALUE", function (a, b) {
    return 'The value "' + String(b) + '" is invalid for option "' + a + '"';
  });
  e("ERR_INVALID_OPT_VALUE_ENCODING", function (a) {
    return 'The value "' + String(a) + '" is invalid for option "encoding"';
  });
  e("ERR_INVALID_REPL_EVAL_CONFIG", 'Cannot specify both "breakEvalOnSigint" and "eval" for REPL');
  e("ERR_INVALID_SYNC_FORK_INPUT", "Asynchronous forks do not support Buffer, Uint8Array or string input: %s");
  e("ERR_INVALID_THIS", 'Value of "this" must be of type %s');
  e("ERR_INVALID_TUPLE", "%s must be an iterable %s tuple");
  e("ERR_INVALID_URL", "Invalid URL: %s");
  e("ERR_INVALID_URL_SCHEME", function (a) {
    return "The URL must be " + f(a, "scheme");
  });
  e("ERR_IPC_CHANNEL_CLOSED", "Channel closed");
  e("ERR_IPC_DISCONNECTED", "IPC channel is already disconnected");
  e("ERR_IPC_ONE_PIPE", "Child process can have only one IPC pipe");
  e("ERR_IPC_SYNC_FORK", "IPC cannot be used with synchronous forks");
  e("ERR_MISSING_ARGS", function () {
    for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];

    I(0 < a.length, "At least one arg needs to be specified");
    b = "The ";
    var c = a.length;
    a = a.map(function (a) {
      return '"' + a + '"';
    });

    switch (c) {
      case 1:
        b += a[0] + " argument";
        break;

      case 2:
        b += a[0] + " and " + a[1] + " arguments";
        break;

      default:
        b += a.slice(0, c - 1).join(", "), b += ", and " + a[c - 1] + " arguments";
    }

    return b + " must be specified";
  });
  e("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
  e("ERR_NAPI_CONS_FUNCTION", "Constructor must be a function");
  e("ERR_NAPI_CONS_PROTOTYPE_OBJECT", "Constructor.prototype must be an object");
  e("ERR_NO_CRYPTO", "Node.js is not compiled with OpenSSL crypto support");
  e("ERR_NO_LONGER_SUPPORTED", "%s is no longer supported");
  e("ERR_PARSE_HISTORY_DATA", "Could not parse history data in %s");
  e("ERR_SOCKET_ALREADY_BOUND", "Socket is already bound");
  e("ERR_SOCKET_BAD_PORT", "Port should be > 0 and < 65536");
  e("ERR_SOCKET_BAD_TYPE", "Bad socket type specified. Valid types are: udp4, udp6");
  e("ERR_SOCKET_CANNOT_SEND", "Unable to send data");
  e("ERR_SOCKET_CLOSED", "Socket is closed");
  e("ERR_SOCKET_DGRAM_NOT_RUNNING", "Not running");
  e("ERR_STDERR_CLOSE", "process.stderr cannot be closed");
  e("ERR_STDOUT_CLOSE", "process.stdout cannot be closed");
  e("ERR_STREAM_WRAP", "Stream has StringDecoder set or is in objectMode");
  e("ERR_TLS_CERT_ALTNAME_INVALID", "Hostname/IP does not match certificate's altnames: %s");
  e("ERR_TLS_DH_PARAM_SIZE", function (a) {
    return "DH parameter size " + a + " is less than 2048";
  });
  e("ERR_TLS_HANDSHAKE_TIMEOUT", "TLS handshake timeout");
  e("ERR_TLS_RENEGOTIATION_FAILED", "Failed to renegotiate");
  e("ERR_TLS_REQUIRED_SERVER_NAME", '"servername" is required parameter for Server.addContext');
  e("ERR_TLS_SESSION_ATTACK", "TSL session renegotiation attack detected");
  e("ERR_TRANSFORM_ALREADY_TRANSFORMING", "Calling transform done when still transforming");
  e("ERR_TRANSFORM_WITH_LENGTH_0", "Calling transform done when writableState.length != 0");
  e("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s");
  e("ERR_UNKNOWN_SIGNAL", "Unknown signal: %s");
  e("ERR_UNKNOWN_STDIN_TYPE", "Unknown stdin file type");
  e("ERR_UNKNOWN_STREAM_TYPE", "Unknown stream file type");
  e("ERR_V8BREAKITERATOR", "Full ICU data not installed. See https://github.com/nodejs/node/wiki/Intl");
});
t(Pc);
var K = u(function (a, b) {
  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  b.ENCODING_UTF8 = "utf8";

  b.assertEncoding = function (a) {
    if (a && !F.Buffer.isEncoding(a)) throw new Pc.TypeError("ERR_INVALID_OPT_VALUE_ENCODING", a);
  };

  b.strToEncoding = function (a, d) {
    return d && d !== b.ENCODING_UTF8 ? "buffer" === d ? new F.Buffer(a) : new F.Buffer(a).toString(d) : a;
  };
});
t(K);
var Qc = u(function (a, b) {
  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  var c = w.constants.S_IFMT,
      d = w.constants.S_IFDIR,
      e = w.constants.S_IFREG,
      f = w.constants.S_IFBLK,
      g = w.constants.S_IFCHR,
      h = w.constants.S_IFLNK,
      k = w.constants.S_IFIFO,
      p = w.constants.S_IFSOCK;

  a = function () {
    function a() {
      this.name = "";
      this.mode = 0;
    }

    a.build = function (b, c) {
      var d = new a(),
          e = b.getNode().mode;
      d.name = K.strToEncoding(b.getName(), c);
      d.mode = e;
      return d;
    };

    a.prototype._checkModeProperty = function (a) {
      return (this.mode & c) === a;
    };

    a.prototype.isDirectory = function () {
      return this._checkModeProperty(d);
    };

    a.prototype.isFile = function () {
      return this._checkModeProperty(e);
    };

    a.prototype.isBlockDevice = function () {
      return this._checkModeProperty(f);
    };

    a.prototype.isCharacterDevice = function () {
      return this._checkModeProperty(g);
    };

    a.prototype.isSymbolicLink = function () {
      return this._checkModeProperty(h);
    };

    a.prototype.isFIFO = function () {
      return this._checkModeProperty(k);
    };

    a.prototype.isSocket = function () {
      return this._checkModeProperty(p);
    };

    return a;
  }();

  b.Dirent = a;
  b.default = a;
});
t(Qc);

function Rc(a, b) {
  for (var c = 0, d = a.length - 1; 0 <= d; d--) {
    var e = a[d];
    "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
  }

  if (b) for (; c--; c) a.unshift("..");
  return a;
}

var Sc = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

function Tc() {
  for (var a = "", b = !1, c = arguments.length - 1; -1 <= c && !b; c--) {
    var d = 0 <= c ? arguments[c] : "/";
    if ("string" !== typeof d) throw new TypeError("Arguments to path.resolve must be strings");
    d && (a = d + "/" + a, b = "/" === d.charAt(0));
  }

  a = Rc(Uc(a.split("/"), function (a) {
    return !!a;
  }), !b).join("/");
  return (b ? "/" : "") + a || ".";
}

function Vc(a) {
  var b = Wc(a),
      c = "/" === Xc(a, -1);
  (a = Rc(Uc(a.split("/"), function (a) {
    return !!a;
  }), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}

function Wc(a) {
  return "/" === a.charAt(0);
}

function Yc(a, b) {
  function c(a) {
    for (var b = 0; b < a.length && "" === a[b]; b++);

    for (var c = a.length - 1; 0 <= c && "" === a[c]; c--);

    return b > c ? [] : a.slice(b, c - b + 1);
  }

  a = Tc(a).substr(1);
  b = Tc(b).substr(1);
  a = c(a.split("/"));
  b = c(b.split("/"));

  for (var d = Math.min(a.length, b.length), e = d, f = 0; f < d; f++) if (a[f] !== b[f]) {
    e = f;
    break;
  }

  d = [];

  for (f = e; f < a.length; f++) d.push("..");

  d = d.concat(b.slice(e));
  return d.join("/");
}

var Zc = {
  extname: function (a) {
    return Sc.exec(a).slice(1)[3];
  },
  basename: function (a, b) {
    a = Sc.exec(a).slice(1)[2];
    b && a.substr(-1 * b.length) === b && (a = a.substr(0, a.length - b.length));
    return a;
  },
  dirname: function (a) {
    var b = Sc.exec(a).slice(1);
    a = b[0];
    b = b[1];
    if (!a && !b) return ".";
    b && (b = b.substr(0, b.length - 1));
    return a + b;
  },
  sep: "/",
  delimiter: ":",
  relative: Yc,
  join: function () {
    var a = Array.prototype.slice.call(arguments, 0);
    return Vc(Uc(a, function (a) {
      if ("string" !== typeof a) throw new TypeError("Arguments to path.join must be strings");
      return a;
    }).join("/"));
  },
  isAbsolute: Wc,
  normalize: Vc,
  resolve: Tc
};

function Uc(a, b) {
  if (a.filter) return a.filter(b);

  for (var c = [], d = 0; d < a.length; d++) b(a[d], d, a) && c.push(a[d]);

  return c;
}

var Xc = "b" === "ab".substr(-1) ? function (a, b, c) {
  return a.substr(b, c);
} : function (a, b, c) {
  0 > b && (b = a.length + b);
  return a.substr(b, c);
},
    $c = u(function (a, b) {
  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  a = "function" === typeof setImmediate ? setImmediate.bind(l) : setTimeout.bind(l);
  b.default = a;
});
t($c);
var L = u(function (a, b) {
  function c() {
    var a = Cb || {};
    a.getuid || (a.getuid = function () {
      return 0;
    });
    a.getgid || (a.getgid = function () {
      return 0;
    });
    a.cwd || (a.cwd = function () {
      return "/";
    });
    a.nextTick || (a.nextTick = $c.default);
    a.emitWarning || (a.emitWarning = function (a, b) {
      console.warn("" + b + (b ? ": " : "") + a);
    });
    a.env || (a.env = {});
    return a;
  }

  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  b.createProcess = c;
  b.default = c();
});
t(L);

function ad() {}

ad.prototype = Object.create(null);

function O() {
  O.init.call(this);
}

O.EventEmitter = O;
O.usingDomains = !1;
O.prototype.domain = void 0;
O.prototype._events = void 0;
O.prototype._maxListeners = void 0;
O.defaultMaxListeners = 10;

O.init = function () {
  this.domain = null;
  this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = new ad(), this._eventsCount = 0);
  this._maxListeners = this._maxListeners || void 0;
};

O.prototype.setMaxListeners = function (a) {
  if ("number" !== typeof a || 0 > a || isNaN(a)) throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = a;
  return this;
};

O.prototype.getMaxListeners = function () {
  return void 0 === this._maxListeners ? O.defaultMaxListeners : this._maxListeners;
};

O.prototype.emit = function (a) {
  var b, c;
  var d = "error" === a;
  if (b = this._events) d = d && null == b.error;else if (!d) return !1;
  var e = this.domain;

  if (d) {
    b = arguments[1];
    if (e) b || (b = Error('Uncaught, unspecified "error" event')), b.domainEmitter = this, b.domain = e, b.domainThrown = !1, e.emit("error", b);else {
      if (b instanceof Error) throw b;
      e = Error('Uncaught, unspecified "error" event. (' + b + ")");
      e.context = b;
      throw e;
    }
    return !1;
  }

  e = b[a];
  if (!e) return !1;
  b = "function" === typeof e;
  var f = arguments.length;

  switch (f) {
    case 1:
      if (b) e.call(this);else for (b = e.length, e = bd(e, b), d = 0; d < b; ++d) e[d].call(this);
      break;

    case 2:
      d = arguments[1];
      if (b) e.call(this, d);else for (b = e.length, e = bd(e, b), f = 0; f < b; ++f) e[f].call(this, d);
      break;

    case 3:
      d = arguments[1];
      f = arguments[2];
      if (b) e.call(this, d, f);else for (b = e.length, e = bd(e, b), c = 0; c < b; ++c) e[c].call(this, d, f);
      break;

    case 4:
      d = arguments[1];
      f = arguments[2];
      c = arguments[3];
      if (b) e.call(this, d, f, c);else {
        b = e.length;
        e = bd(e, b);

        for (var g = 0; g < b; ++g) e[g].call(this, d, f, c);
      }
      break;

    default:
      d = Array(f - 1);

      for (c = 1; c < f; c++) d[c - 1] = arguments[c];

      if (b) e.apply(this, d);else for (b = e.length, e = bd(e, b), f = 0; f < b; ++f) e[f].apply(this, d);
  }

  return !0;
};

function cd(a, b, c, d) {
  var e;
  if ("function" !== typeof c) throw new TypeError('"listener" argument must be a function');

  if (e = a._events) {
    e.newListener && (a.emit("newListener", b, c.listener ? c.listener : c), e = a._events);
    var f = e[b];
  } else e = a._events = new ad(), a._eventsCount = 0;

  f ? ("function" === typeof f ? f = e[b] = d ? [c, f] : [f, c] : d ? f.unshift(c) : f.push(c), f.warned || (c = void 0 === a._maxListeners ? O.defaultMaxListeners : a._maxListeners) && 0 < c && f.length > c && (f.warned = !0, c = Error("Possible EventEmitter memory leak detected. " + f.length + " " + b + " listeners added. Use emitter.setMaxListeners() to increase limit"), c.name = "MaxListenersExceededWarning", c.emitter = a, c.type = b, c.count = f.length, "function" === typeof console.warn ? console.warn(c) : console.log(c))) : (e[b] = c, ++a._eventsCount);
  return a;
}

O.prototype.addListener = function (a, b) {
  return cd(this, a, b, !1);
};

O.prototype.on = O.prototype.addListener;

O.prototype.prependListener = function (a, b) {
  return cd(this, a, b, !0);
};

function dd(a, b, c) {
  function d() {
    a.removeListener(b, d);
    e || (e = !0, c.apply(a, arguments));
  }

  var e = !1;
  d.listener = c;
  return d;
}

O.prototype.once = function (a, b) {
  if ("function" !== typeof b) throw new TypeError('"listener" argument must be a function');
  this.on(a, dd(this, a, b));
  return this;
};

O.prototype.prependOnceListener = function (a, b) {
  if ("function" !== typeof b) throw new TypeError('"listener" argument must be a function');
  this.prependListener(a, dd(this, a, b));
  return this;
};

O.prototype.removeListener = function (a, b) {
  var c;
  if ("function" !== typeof b) throw new TypeError('"listener" argument must be a function');
  var d = this._events;
  if (!d) return this;
  var e = d[a];
  if (!e) return this;
  if (e === b || e.listener && e.listener === b) 0 === --this._eventsCount ? this._events = new ad() : (delete d[a], d.removeListener && this.emit("removeListener", a, e.listener || b));else if ("function" !== typeof e) {
    var f = -1;

    for (c = e.length; 0 < c--;) if (e[c] === b || e[c].listener && e[c].listener === b) {
      var g = e[c].listener;
      f = c;
      break;
    }

    if (0 > f) return this;

    if (1 === e.length) {
      e[0] = void 0;
      if (0 === --this._eventsCount) return this._events = new ad(), this;
      delete d[a];
    } else {
      c = f + 1;

      for (var h = e.length; c < h; f += 1, c += 1) e[f] = e[c];

      e.pop();
    }

    d.removeListener && this.emit("removeListener", a, g || b);
  }
  return this;
};

O.prototype.removeAllListeners = function (a) {
  var b = this._events;
  if (!b) return this;
  if (!b.removeListener) return 0 === arguments.length ? (this._events = new ad(), this._eventsCount = 0) : b[a] && (0 === --this._eventsCount ? this._events = new ad() : delete b[a]), this;

  if (0 === arguments.length) {
    b = Object.keys(b);

    for (var c = 0, d; c < b.length; ++c) d = b[c], "removeListener" !== d && this.removeAllListeners(d);

    this.removeAllListeners("removeListener");
    this._events = new ad();
    this._eventsCount = 0;
    return this;
  }

  b = b[a];
  if ("function" === typeof b) this.removeListener(a, b);else if (b) {
    do this.removeListener(a, b[b.length - 1]); while (b[0]);
  }
  return this;
};

O.prototype.listeners = function (a) {
  var b = this._events;
  if (b) {
    if (a = b[a]) {
      if ("function" === typeof a) a = [a.listener || a];else {
        b = Array(a.length);

        for (var c = 0; c < b.length; ++c) b[c] = a[c].listener || a[c];

        a = b;
      }
    } else a = [];
  } else a = [];
  return a;
};

O.listenerCount = function (a, b) {
  return "function" === typeof a.listenerCount ? a.listenerCount(b) : ed.call(a, b);
};

O.prototype.listenerCount = ed;

function ed(a) {
  var b = this._events;

  if (b) {
    a = b[a];
    if ("function" === typeof a) return 1;
    if (a) return a.length;
  }

  return 0;
}

O.prototype.eventNames = function () {
  return 0 < this._eventsCount ? Reflect.ownKeys(this._events) : [];
};

function bd(a, b) {
  for (var c = Array(b); b--;) c[b] = a[b];

  return c;
}

var fd = u(function (a, b) {
  var c = l && l.__extends || function () {
    function a(b, c) {
      a = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (a, b) {
        a.__proto__ = b;
      } || function (a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
      };

      return a(b, c);
    }

    return function (b, c) {
      function d() {
        this.constructor = b;
      }

      a(b, c);
      b.prototype = null === c ? Object.create(c) : (d.prototype = c.prototype, new d());
    };
  }();

  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  var d = w.constants.S_IFMT,
      e = w.constants.S_IFDIR,
      f = w.constants.S_IFREG,
      g = w.constants.S_IFLNK,
      h = w.constants.O_APPEND;
  b.SEP = "/";

  a = function (a) {
    function b(b, c) {
      void 0 === c && (c = 438);
      var d = a.call(this) || this;
      d.uid = L.default.getuid();
      d.gid = L.default.getgid();
      d.atime = new Date();
      d.mtime = new Date();
      d.ctime = new Date();
      d.perm = 438;
      d.mode = f;
      d.nlink = 1;
      d.perm = c;
      d.mode |= c;
      d.ino = b;
      return d;
    }

    c(b, a);

    b.prototype.getString = function (a) {
      void 0 === a && (a = "utf8");
      return this.getBuffer().toString(a);
    };

    b.prototype.setString = function (a) {
      this.buf = F.bufferFrom(a, "utf8");
      this.touch();
    };

    b.prototype.getBuffer = function () {
      this.buf || this.setBuffer(F.bufferAllocUnsafe(0));
      return F.bufferFrom(this.buf);
    };

    b.prototype.setBuffer = function (a) {
      this.buf = F.bufferFrom(a);
      this.touch();
    };

    b.prototype.getSize = function () {
      return this.buf ? this.buf.length : 0;
    };

    b.prototype.setModeProperty = function (a) {
      this.mode = this.mode & ~d | a;
    };

    b.prototype.setIsFile = function () {
      this.setModeProperty(f);
    };

    b.prototype.setIsDirectory = function () {
      this.setModeProperty(e);
    };

    b.prototype.setIsSymlink = function () {
      this.setModeProperty(g);
    };

    b.prototype.isFile = function () {
      return (this.mode & d) === f;
    };

    b.prototype.isDirectory = function () {
      return (this.mode & d) === e;
    };

    b.prototype.isSymlink = function () {
      return (this.mode & d) === g;
    };

    b.prototype.makeSymlink = function (a) {
      this.symlink = a;
      this.setIsSymlink();
    };

    b.prototype.write = function (a, b, c, d) {
      void 0 === b && (b = 0);
      void 0 === c && (c = a.length);
      void 0 === d && (d = 0);
      this.buf || (this.buf = F.bufferAllocUnsafe(0));

      if (d + c > this.buf.length) {
        var e = F.bufferAllocUnsafe(d + c);
        this.buf.copy(e, 0, 0, this.buf.length);
        this.buf = e;
      }

      a.copy(this.buf, d, b, b + c);
      this.touch();
      return c;
    };

    b.prototype.read = function (a, b, c, d) {
      void 0 === b && (b = 0);
      void 0 === c && (c = a.byteLength);
      void 0 === d && (d = 0);
      this.buf || (this.buf = F.bufferAllocUnsafe(0));
      c > a.byteLength && (c = a.byteLength);
      c + d > this.buf.length && (c = this.buf.length - d);
      this.buf.copy(a, b, d, d + c);
      return c;
    };

    b.prototype.truncate = function (a) {
      void 0 === a && (a = 0);
      if (a) {
        if (this.buf || (this.buf = F.bufferAllocUnsafe(0)), a <= this.buf.length) this.buf = this.buf.slice(0, a);else {
          var b = F.bufferAllocUnsafe(0);
          this.buf.copy(b);
          b.fill(0, a);
        }
      } else this.buf = F.bufferAllocUnsafe(0);
      this.touch();
    };

    b.prototype.chmod = function (a) {
      this.perm = a;
      this.mode = this.mode & -512 | a;
      this.touch();
    };

    b.prototype.chown = function (a, b) {
      this.uid = a;
      this.gid = b;
      this.touch();
    };

    b.prototype.touch = function () {
      this.mtime = new Date();
      this.emit("change", this);
    };

    b.prototype.canRead = function (a, b) {
      void 0 === a && (a = L.default.getuid());
      void 0 === b && (b = L.default.getgid());
      return this.perm & 4 || b === this.gid && this.perm & 32 || a === this.uid && this.perm & 256 ? !0 : !1;
    };

    b.prototype.canWrite = function (a, b) {
      void 0 === a && (a = L.default.getuid());
      void 0 === b && (b = L.default.getgid());
      return this.perm & 2 || b === this.gid && this.perm & 16 || a === this.uid && this.perm & 128 ? !0 : !1;
    };

    b.prototype.del = function () {
      this.emit("delete", this);
    };

    b.prototype.toJSON = function () {
      return {
        ino: this.ino,
        uid: this.uid,
        gid: this.gid,
        atime: this.atime.getTime(),
        mtime: this.mtime.getTime(),
        ctime: this.ctime.getTime(),
        perm: this.perm,
        mode: this.mode,
        nlink: this.nlink,
        symlink: this.symlink,
        data: this.getString()
      };
    };

    return b;
  }(O.EventEmitter);

  b.Node = a;

  a = function (a) {
    function d(b, c, d) {
      var e = a.call(this) || this;
      e.children = {};
      e.steps = [];
      e.ino = 0;
      e.length = 0;
      e.vol = b;
      e.parent = c;
      e.steps = c ? c.steps.concat([d]) : [d];
      return e;
    }

    c(d, a);

    d.prototype.setNode = function (a) {
      this.node = a;
      this.ino = a.ino;
    };

    d.prototype.getNode = function () {
      return this.node;
    };

    d.prototype.createChild = function (a, b) {
      void 0 === b && (b = this.vol.createNode());
      var c = new d(this.vol, this, a);
      c.setNode(b);
      b.isDirectory();
      this.setChild(a, c);
      return c;
    };

    d.prototype.setChild = function (a, b) {
      void 0 === b && (b = new d(this.vol, this, a));
      this.children[a] = b;
      b.parent = this;
      this.length++;
      this.emit("child:add", b, this);
      return b;
    };

    d.prototype.deleteChild = function (a) {
      delete this.children[a.getName()];
      this.length--;
      this.emit("child:delete", a, this);
    };

    d.prototype.getChild = function (a) {
      if (Object.hasOwnProperty.call(this.children, a)) return this.children[a];
    };

    d.prototype.getPath = function () {
      return this.steps.join(b.SEP);
    };

    d.prototype.getName = function () {
      return this.steps[this.steps.length - 1];
    };

    d.prototype.walk = function (a, b, c) {
      void 0 === b && (b = a.length);
      void 0 === c && (c = 0);
      if (c >= a.length || c >= b) return this;
      var d = this.getChild(a[c]);
      return d ? d.walk(a, b, c + 1) : null;
    };

    d.prototype.toJSON = function () {
      return {
        steps: this.steps,
        ino: this.ino,
        children: Object.keys(this.children)
      };
    };

    return d;
  }(O.EventEmitter);

  b.Link = a;

  a = function () {
    function a(a, b, c, d) {
      this.position = 0;
      this.link = a;
      this.node = b;
      this.flags = c;
      this.fd = d;
    }

    a.prototype.getString = function () {
      return this.node.getString();
    };

    a.prototype.setString = function (a) {
      this.node.setString(a);
    };

    a.prototype.getBuffer = function () {
      return this.node.getBuffer();
    };

    a.prototype.setBuffer = function (a) {
      this.node.setBuffer(a);
    };

    a.prototype.getSize = function () {
      return this.node.getSize();
    };

    a.prototype.truncate = function (a) {
      this.node.truncate(a);
    };

    a.prototype.seekTo = function (a) {
      this.position = a;
    };

    a.prototype.stats = function () {
      return ka.default.build(this.node);
    };

    a.prototype.write = function (a, b, c, d) {
      void 0 === b && (b = 0);
      void 0 === c && (c = a.length);
      "number" !== typeof d && (d = this.position);
      this.flags & h && (d = this.getSize());
      a = this.node.write(a, b, c, d);
      this.position = d + a;
      return a;
    };

    a.prototype.read = function (a, b, c, d) {
      void 0 === b && (b = 0);
      void 0 === c && (c = a.byteLength);
      "number" !== typeof d && (d = this.position);
      a = this.node.read(a, b, c, d);
      this.position = d + a;
      return a;
    };

    a.prototype.chmod = function (a) {
      this.node.chmod(a);
    };

    a.prototype.chown = function (a, b) {
      this.node.chown(a, b);
    };

    return a;
  }();

  b.File = a;
});
t(fd);
var gd = fd.Node,
    hd = u(function (a, b) {
  Object.defineProperty(b, "__esModule", {
    value: !0
  });

  b.default = function (a, b, e) {
    var c = setTimeout.apply(null, arguments);
    c && "object" === typeof c && "function" === typeof c.unref && c.unref();
    return c;
  };
});
t(hd);

function id() {
  this.tail = this.head = null;
  this.length = 0;
}

id.prototype.push = function (a) {
  a = {
    data: a,
    next: null
  };
  0 < this.length ? this.tail.next = a : this.head = a;
  this.tail = a;
  ++this.length;
};

id.prototype.unshift = function (a) {
  a = {
    data: a,
    next: this.head
  };
  0 === this.length && (this.tail = a);
  this.head = a;
  ++this.length;
};

id.prototype.shift = function () {
  if (0 !== this.length) {
    var a = this.head.data;
    this.head = 1 === this.length ? this.tail = null : this.head.next;
    --this.length;
    return a;
  }
};

id.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

id.prototype.join = function (a) {
  if (0 === this.length) return "";

  for (var b = this.head, c = "" + b.data; b = b.next;) c += a + b.data;

  return c;
};

id.prototype.concat = function (a) {
  if (0 === this.length) return z.alloc(0);
  if (1 === this.length) return this.head.data;
  a = z.allocUnsafe(a >>> 0);

  for (var b = this.head, c = 0; b;) b.data.copy(a, c), c += b.data.length, b = b.next;

  return a;
};

var jd = z.isEncoding || function (a) {
  switch (a && a.toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
    case "raw":
      return !0;

    default:
      return !1;
  }
};

function kd(a) {
  this.encoding = (a || "utf8").toLowerCase().replace(/[-_]/, "");
  if (a && !jd(a)) throw Error("Unknown encoding: " + a);

  switch (this.encoding) {
    case "utf8":
      this.surrogateSize = 3;
      break;

    case "ucs2":
    case "utf16le":
      this.surrogateSize = 2;
      this.detectIncompleteChar = ld;
      break;

    case "base64":
      this.surrogateSize = 3;
      this.detectIncompleteChar = md;
      break;

    default:
      this.write = nd;
      return;
  }

  this.charBuffer = new z(6);
  this.charLength = this.charReceived = 0;
}

kd.prototype.write = function (a) {
  for (var b = ""; this.charLength;) {
    b = a.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : a.length;
    a.copy(this.charBuffer, this.charReceived, 0, b);
    this.charReceived += b;
    if (this.charReceived < this.charLength) return "";
    a = a.slice(b, a.length);
    b = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
    var c = b.charCodeAt(b.length - 1);
    if (55296 <= c && 56319 >= c) this.charLength += this.surrogateSize, b = "";else {
      this.charReceived = this.charLength = 0;
      if (0 === a.length) return b;
      break;
    }
  }

  this.detectIncompleteChar(a);
  var d = a.length;
  this.charLength && (a.copy(this.charBuffer, 0, a.length - this.charReceived, d), d -= this.charReceived);
  b += a.toString(this.encoding, 0, d);
  d = b.length - 1;
  c = b.charCodeAt(d);
  return 55296 <= c && 56319 >= c ? (c = this.surrogateSize, this.charLength += c, this.charReceived += c, this.charBuffer.copy(this.charBuffer, c, 0, c), a.copy(this.charBuffer, 0, 0, c), b.substring(0, d)) : b;
};

kd.prototype.detectIncompleteChar = function (a) {
  for (var b = 3 <= a.length ? 3 : a.length; 0 < b; b--) {
    var c = a[a.length - b];

    if (1 == b && 6 == c >> 5) {
      this.charLength = 2;
      break;
    }

    if (2 >= b && 14 == c >> 4) {
      this.charLength = 3;
      break;
    }

    if (3 >= b && 30 == c >> 3) {
      this.charLength = 4;
      break;
    }
  }

  this.charReceived = b;
};

kd.prototype.end = function (a) {
  var b = "";
  a && a.length && (b = this.write(a));
  this.charReceived && (a = this.encoding, b += this.charBuffer.slice(0, this.charReceived).toString(a));
  return b;
};

function nd(a) {
  return a.toString(this.encoding);
}

function ld(a) {
  this.charLength = (this.charReceived = a.length % 2) ? 2 : 0;
}

function md(a) {
  this.charLength = (this.charReceived = a.length % 3) ? 3 : 0;
}

P.ReadableState = od;
var Q = Mb("stream");
Db(P, O);

function pd(a, b, c) {
  if ("function" === typeof a.prependListener) return a.prependListener(b, c);
  if (a._events && a._events[b]) Array.isArray(a._events[b]) ? a._events[b].unshift(c) : a._events[b] = [c, a._events[b]];else a.on(b, c);
}

function od(a, b) {
  a = a || {};
  this.objectMode = !!a.objectMode;
  b instanceof V && (this.objectMode = this.objectMode || !!a.readableObjectMode);
  b = a.highWaterMark;
  var c = this.objectMode ? 16 : 16384;
  this.highWaterMark = b || 0 === b ? b : c;
  this.highWaterMark = ~~this.highWaterMark;
  this.buffer = new id();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.reading = this.endEmitted = this.ended = !1;
  this.sync = !0;
  this.resumeScheduled = this.readableListening = this.emittedReadable = this.needReadable = !1;
  this.defaultEncoding = a.defaultEncoding || "utf8";
  this.ranOut = !1;
  this.awaitDrain = 0;
  this.readingMore = !1;
  this.encoding = this.decoder = null;
  a.encoding && (this.decoder = new kd(a.encoding), this.encoding = a.encoding);
}

function P(a) {
  if (!(this instanceof P)) return new P(a);
  this._readableState = new od(a, this);
  this.readable = !0;
  a && "function" === typeof a.read && (this._read = a.read);
  O.call(this);
}

P.prototype.push = function (a, b) {
  var c = this._readableState;
  c.objectMode || "string" !== typeof a || (b = b || c.defaultEncoding, b !== c.encoding && (a = z.from(a, b), b = ""));
  return qd(this, c, a, b, !1);
};

P.prototype.unshift = function (a) {
  return qd(this, this._readableState, a, "", !0);
};

P.prototype.isPaused = function () {
  return !1 === this._readableState.flowing;
};

function qd(a, b, c, d, e) {
  var f = c;
  var g = null;
  Na(f) || "string" === typeof f || null === f || void 0 === f || b.objectMode || (g = new TypeError("Invalid non-string/buffer chunk"));
  if (f = g) a.emit("error", f);else if (null === c) b.reading = !1, b.ended || (b.decoder && (c = b.decoder.end()) && c.length && (b.buffer.push(c), b.length += b.objectMode ? 1 : c.length), b.ended = !0, rd(a));else if (b.objectMode || c && 0 < c.length) {
    if (b.ended && !e) a.emit("error", Error("stream.push() after EOF"));else if (b.endEmitted && e) a.emit("error", Error("stream.unshift() after end event"));else {
      if (b.decoder && !e && !d) {
        c = b.decoder.write(c);
        var h = !b.objectMode && 0 === c.length;
      }

      e || (b.reading = !1);
      h || (b.flowing && 0 === b.length && !b.sync ? (a.emit("data", c), a.read(0)) : (b.length += b.objectMode ? 1 : c.length, e ? b.buffer.unshift(c) : b.buffer.push(c), b.needReadable && rd(a)));
      b.readingMore || (b.readingMore = !0, G(sd, a, b));
    }
  } else e || (b.reading = !1);
  return !b.ended && (b.needReadable || b.length < b.highWaterMark || 0 === b.length);
}

P.prototype.setEncoding = function (a) {
  this._readableState.decoder = new kd(a);
  this._readableState.encoding = a;
  return this;
};

function td(a, b) {
  if (0 >= a || 0 === b.length && b.ended) return 0;
  if (b.objectMode) return 1;
  if (a !== a) return b.flowing && b.length ? b.buffer.head.data.length : b.length;

  if (a > b.highWaterMark) {
    var c = a;
    8388608 <= c ? c = 8388608 : (c--, c |= c >>> 1, c |= c >>> 2, c |= c >>> 4, c |= c >>> 8, c |= c >>> 16, c++);
    b.highWaterMark = c;
  }

  return a <= b.length ? a : b.ended ? b.length : (b.needReadable = !0, 0);
}

P.prototype.read = function (a) {
  Q("read", a);
  a = parseInt(a, 10);
  var b = this._readableState,
      c = a;
  0 !== a && (b.emittedReadable = !1);
  if (0 === a && b.needReadable && (b.length >= b.highWaterMark || b.ended)) return Q("read: emitReadable", b.length, b.ended), 0 === b.length && b.ended ? Jd(this) : rd(this), null;
  a = td(a, b);
  if (0 === a && b.ended) return 0 === b.length && Jd(this), null;
  var d = b.needReadable;
  Q("need readable", d);
  if (0 === b.length || b.length - a < b.highWaterMark) d = !0, Q("length less than watermark", d);
  b.ended || b.reading ? Q("reading or ended", !1) : d && (Q("do read"), b.reading = !0, b.sync = !0, 0 === b.length && (b.needReadable = !0), this._read(b.highWaterMark), b.sync = !1, b.reading || (a = td(c, b)));
  d = 0 < a ? Kd(a, b) : null;
  null === d ? (b.needReadable = !0, a = 0) : b.length -= a;
  0 === b.length && (b.ended || (b.needReadable = !0), c !== a && b.ended && Jd(this));
  null !== d && this.emit("data", d);
  return d;
};

function rd(a) {
  var b = a._readableState;
  b.needReadable = !1;
  b.emittedReadable || (Q("emitReadable", b.flowing), b.emittedReadable = !0, b.sync ? G(Ld, a) : Ld(a));
}

function Ld(a) {
  Q("emit readable");
  a.emit("readable");
  Md(a);
}

function sd(a, b) {
  for (var c = b.length; !b.reading && !b.flowing && !b.ended && b.length < b.highWaterMark && (Q("maybeReadMore read 0"), a.read(0), c !== b.length);) c = b.length;

  b.readingMore = !1;
}

P.prototype._read = function () {
  this.emit("error", Error("not implemented"));
};

P.prototype.pipe = function (a, b) {
  function c(a) {
    Q("onunpipe");
    a === n && e();
  }

  function d() {
    Q("onend");
    a.end();
  }

  function e() {
    Q("cleanup");
    a.removeListener("close", h);
    a.removeListener("finish", k);
    a.removeListener("drain", B);
    a.removeListener("error", g);
    a.removeListener("unpipe", c);
    n.removeListener("end", d);
    n.removeListener("end", e);
    n.removeListener("data", f);
    m = !0;
    !q.awaitDrain || a._writableState && !a._writableState.needDrain || B();
  }

  function f(b) {
    Q("ondata");
    v = !1;
    !1 !== a.write(b) || v || ((1 === q.pipesCount && q.pipes === a || 1 < q.pipesCount && -1 !== Nd(q.pipes, a)) && !m && (Q("false write response, pause", n._readableState.awaitDrain), n._readableState.awaitDrain++, v = !0), n.pause());
  }

  function g(b) {
    Q("onerror", b);
    p();
    a.removeListener("error", g);
    0 === a.listeners("error").length && a.emit("error", b);
  }

  function h() {
    a.removeListener("finish", k);
    p();
  }

  function k() {
    Q("onfinish");
    a.removeListener("close", h);
    p();
  }

  function p() {
    Q("unpipe");
    n.unpipe(a);
  }

  var n = this,
      q = this._readableState;

  switch (q.pipesCount) {
    case 0:
      q.pipes = a;
      break;

    case 1:
      q.pipes = [q.pipes, a];
      break;

    default:
      q.pipes.push(a);
  }

  q.pipesCount += 1;
  Q("pipe count=%d opts=%j", q.pipesCount, b);
  b = b && !1 === b.end ? e : d;
  if (q.endEmitted) G(b);else n.once("end", b);
  a.on("unpipe", c);
  var B = Od(n);
  a.on("drain", B);
  var m = !1,
      v = !1;
  n.on("data", f);
  pd(a, "error", g);
  a.once("close", h);
  a.once("finish", k);
  a.emit("pipe", n);
  q.flowing || (Q("pipe resume"), n.resume());
  return a;
};

function Od(a) {
  return function () {
    var b = a._readableState;
    Q("pipeOnDrain", b.awaitDrain);
    b.awaitDrain && b.awaitDrain--;
    0 === b.awaitDrain && a.listeners("data").length && (b.flowing = !0, Md(a));
  };
}

P.prototype.unpipe = function (a) {
  var b = this._readableState;
  if (0 === b.pipesCount) return this;

  if (1 === b.pipesCount) {
    if (a && a !== b.pipes) return this;
    a || (a = b.pipes);
    b.pipes = null;
    b.pipesCount = 0;
    b.flowing = !1;
    a && a.emit("unpipe", this);
    return this;
  }

  if (!a) {
    a = b.pipes;
    var c = b.pipesCount;
    b.pipes = null;
    b.pipesCount = 0;
    b.flowing = !1;

    for (b = 0; b < c; b++) a[b].emit("unpipe", this);

    return this;
  }

  c = Nd(b.pipes, a);
  if (-1 === c) return this;
  b.pipes.splice(c, 1);
  --b.pipesCount;
  1 === b.pipesCount && (b.pipes = b.pipes[0]);
  a.emit("unpipe", this);
  return this;
};

P.prototype.on = function (a, b) {
  b = O.prototype.on.call(this, a, b);
  "data" === a ? !1 !== this._readableState.flowing && this.resume() : "readable" === a && (a = this._readableState, a.endEmitted || a.readableListening || (a.readableListening = a.needReadable = !0, a.emittedReadable = !1, a.reading ? a.length && rd(this) : G(Pd, this)));
  return b;
};

P.prototype.addListener = P.prototype.on;

function Pd(a) {
  Q("readable nexttick read 0");
  a.read(0);
}

P.prototype.resume = function () {
  var a = this._readableState;
  a.flowing || (Q("resume"), a.flowing = !0, a.resumeScheduled || (a.resumeScheduled = !0, G(Qd, this, a)));
  return this;
};

function Qd(a, b) {
  b.reading || (Q("resume read 0"), a.read(0));
  b.resumeScheduled = !1;
  b.awaitDrain = 0;
  a.emit("resume");
  Md(a);
  b.flowing && !b.reading && a.read(0);
}

P.prototype.pause = function () {
  Q("call pause flowing=%j", this._readableState.flowing);
  !1 !== this._readableState.flowing && (Q("pause"), this._readableState.flowing = !1, this.emit("pause"));
  return this;
};

function Md(a) {
  var b = a._readableState;

  for (Q("flow", b.flowing); b.flowing && null !== a.read(););
}

P.prototype.wrap = function (a) {
  var b = this._readableState,
      c = !1,
      d = this;
  a.on("end", function () {
    Q("wrapped end");

    if (b.decoder && !b.ended) {
      var a = b.decoder.end();
      a && a.length && d.push(a);
    }

    d.push(null);
  });
  a.on("data", function (e) {
    Q("wrapped data");
    b.decoder && (e = b.decoder.write(e));
    b.objectMode && (null === e || void 0 === e) || !(b.objectMode || e && e.length) || d.push(e) || (c = !0, a.pause());
  });

  for (var e in a) void 0 === this[e] && "function" === typeof a[e] && (this[e] = function (b) {
    return function () {
      return a[b].apply(a, arguments);
    };
  }(e));

  Rd(["error", "close", "destroy", "pause", "resume"], function (b) {
    a.on(b, d.emit.bind(d, b));
  });

  d._read = function (b) {
    Q("wrapped _read", b);
    c && (c = !1, a.resume());
  };

  return d;
};

P._fromList = Kd;

function Kd(a, b) {
  if (0 === b.length) return null;
  if (b.objectMode) var c = b.buffer.shift();else if (!a || a >= b.length) c = b.decoder ? b.buffer.join("") : 1 === b.buffer.length ? b.buffer.head.data : b.buffer.concat(b.length), b.buffer.clear();else {
    c = b.buffer;
    b = b.decoder;
    if (a < c.head.data.length) b = c.head.data.slice(0, a), c.head.data = c.head.data.slice(a);else {
      if (a === c.head.data.length) c = c.shift();else if (b) {
        b = c.head;
        var d = 1,
            e = b.data;

        for (a -= e.length; b = b.next;) {
          var f = b.data,
              g = a > f.length ? f.length : a;
          e = g === f.length ? e + f : e + f.slice(0, a);
          a -= g;

          if (0 === a) {
            g === f.length ? (++d, c.head = b.next ? b.next : c.tail = null) : (c.head = b, b.data = f.slice(g));
            break;
          }

          ++d;
        }

        c.length -= d;
        c = e;
      } else {
        b = z.allocUnsafe(a);
        d = c.head;
        e = 1;
        d.data.copy(b);

        for (a -= d.data.length; d = d.next;) {
          f = d.data;
          g = a > f.length ? f.length : a;
          f.copy(b, b.length - a, 0, g);
          a -= g;

          if (0 === a) {
            g === f.length ? (++e, c.head = d.next ? d.next : c.tail = null) : (c.head = d, d.data = f.slice(g));
            break;
          }

          ++e;
        }

        c.length -= e;
        c = b;
      }
      b = c;
    }
    c = b;
  }
  return c;
}

function Jd(a) {
  var b = a._readableState;
  if (0 < b.length) throw Error('"endReadable()" called on non-empty stream');
  b.endEmitted || (b.ended = !0, G(Sd, b, a));
}

function Sd(a, b) {
  a.endEmitted || 0 !== a.length || (a.endEmitted = !0, b.readable = !1, b.emit("end"));
}

function Rd(a, b) {
  for (var c = 0, d = a.length; c < d; c++) b(a[c], c);
}

function Nd(a, b) {
  for (var c = 0, d = a.length; c < d; c++) if (a[c] === b) return c;

  return -1;
}

W.WritableState = Td;
Db(W, O);

function Ud() {}

function Vd(a, b, c) {
  this.chunk = a;
  this.encoding = b;
  this.callback = c;
  this.next = null;
}

function Td(a, b) {
  Object.defineProperty(this, "buffer", {
    get: Ib(function () {
      return this.getBuffer();
    }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.")
  });
  a = a || {};
  this.objectMode = !!a.objectMode;
  b instanceof V && (this.objectMode = this.objectMode || !!a.writableObjectMode);
  var c = a.highWaterMark,
      d = this.objectMode ? 16 : 16384;
  this.highWaterMark = c || 0 === c ? c : d;
  this.highWaterMark = ~~this.highWaterMark;
  this.finished = this.ended = this.ending = this.needDrain = !1;
  this.decodeStrings = !1 !== a.decodeStrings;
  this.defaultEncoding = a.defaultEncoding || "utf8";
  this.length = 0;
  this.writing = !1;
  this.corked = 0;
  this.sync = !0;
  this.bufferProcessing = !1;

  this.onwrite = function (a) {
    var c = b._writableState,
        d = c.sync,
        e = c.writecb;
    c.writing = !1;
    c.writecb = null;
    c.length -= c.writelen;
    c.writelen = 0;
    a ? (--c.pendingcb, d ? G(e, a) : e(a), b._writableState.errorEmitted = !0, b.emit("error", a)) : ((a = Wd(c)) || c.corked || c.bufferProcessing || !c.bufferedRequest || Xd(b, c), d ? G(Yd, b, c, a, e) : Yd(b, c, a, e));
  };

  this.writecb = null;
  this.writelen = 0;
  this.lastBufferedRequest = this.bufferedRequest = null;
  this.pendingcb = 0;
  this.errorEmitted = this.prefinished = !1;
  this.bufferedRequestCount = 0;
  this.corkedRequestsFree = new Zd(this);
}

Td.prototype.getBuffer = function () {
  for (var a = this.bufferedRequest, b = []; a;) b.push(a), a = a.next;

  return b;
};

function W(a) {
  if (!(this instanceof W || this instanceof V)) return new W(a);
  this._writableState = new Td(a, this);
  this.writable = !0;
  a && ("function" === typeof a.write && (this._write = a.write), "function" === typeof a.writev && (this._writev = a.writev));
  O.call(this);
}

W.prototype.pipe = function () {
  this.emit("error", Error("Cannot pipe, not readable"));
};

W.prototype.write = function (a, b, c) {
  var d = this._writableState,
      e = !1;
  "function" === typeof b && (c = b, b = null);
  z.isBuffer(a) ? b = "buffer" : b || (b = d.defaultEncoding);
  "function" !== typeof c && (c = Ud);
  if (d.ended) d = c, a = Error("write after end"), this.emit("error", a), G(d, a);else {
    var f = c,
        g = !0,
        h = !1;
    null === a ? h = new TypeError("May not write null values to stream") : z.isBuffer(a) || "string" === typeof a || void 0 === a || d.objectMode || (h = new TypeError("Invalid non-string/buffer chunk"));
    h && (this.emit("error", h), G(f, h), g = !1);
    g && (d.pendingcb++, e = b, d.objectMode || !1 === d.decodeStrings || "string" !== typeof a || (a = z.from(a, e)), z.isBuffer(a) && (e = "buffer"), f = d.objectMode ? 1 : a.length, d.length += f, b = d.length < d.highWaterMark, b || (d.needDrain = !0), d.writing || d.corked ? (f = d.lastBufferedRequest, d.lastBufferedRequest = new Vd(a, e, c), f ? f.next = d.lastBufferedRequest : d.bufferedRequest = d.lastBufferedRequest, d.bufferedRequestCount += 1) : $d(this, d, !1, f, a, e, c), e = b);
  }
  return e;
};

W.prototype.cork = function () {
  this._writableState.corked++;
};

W.prototype.uncork = function () {
  var a = this._writableState;
  a.corked && (a.corked--, a.writing || a.corked || a.finished || a.bufferProcessing || !a.bufferedRequest || Xd(this, a));
};

W.prototype.setDefaultEncoding = function (a) {
  "string" === typeof a && (a = a.toLowerCase());
  if (!(-1 < "hex utf8 utf-8 ascii binary base64 ucs2 ucs-2 utf16le utf-16le raw".split(" ").indexOf((a + "").toLowerCase()))) throw new TypeError("Unknown encoding: " + a);
  this._writableState.defaultEncoding = a;
  return this;
};

function $d(a, b, c, d, e, f, g) {
  b.writelen = d;
  b.writecb = g;
  b.writing = !0;
  b.sync = !0;
  c ? a._writev(e, b.onwrite) : a._write(e, f, b.onwrite);
  b.sync = !1;
}

function Yd(a, b, c, d) {
  !c && 0 === b.length && b.needDrain && (b.needDrain = !1, a.emit("drain"));
  b.pendingcb--;
  d();
  ae(a, b);
}

function Xd(a, b) {
  b.bufferProcessing = !0;
  var c = b.bufferedRequest;

  if (a._writev && c && c.next) {
    var d = Array(b.bufferedRequestCount),
        e = b.corkedRequestsFree;
    e.entry = c;

    for (var f = 0; c;) d[f] = c, c = c.next, f += 1;

    $d(a, b, !0, b.length, d, "", e.finish);
    b.pendingcb++;
    b.lastBufferedRequest = null;
    e.next ? (b.corkedRequestsFree = e.next, e.next = null) : b.corkedRequestsFree = new Zd(b);
  } else {
    for (; c && (d = c.chunk, $d(a, b, !1, b.objectMode ? 1 : d.length, d, c.encoding, c.callback), c = c.next, !b.writing););

    null === c && (b.lastBufferedRequest = null);
  }

  b.bufferedRequestCount = 0;
  b.bufferedRequest = c;
  b.bufferProcessing = !1;
}

W.prototype._write = function (a, b, c) {
  c(Error("not implemented"));
};

W.prototype._writev = null;

W.prototype.end = function (a, b, c) {
  var d = this._writableState;
  "function" === typeof a ? (c = a, b = a = null) : "function" === typeof b && (c = b, b = null);
  null !== a && void 0 !== a && this.write(a, b);
  d.corked && (d.corked = 1, this.uncork());

  if (!d.ending && !d.finished) {
    a = c;
    d.ending = !0;
    ae(this, d);
    if (a) if (d.finished) G(a);else this.once("finish", a);
    d.ended = !0;
    this.writable = !1;
  }
};

function Wd(a) {
  return a.ending && 0 === a.length && null === a.bufferedRequest && !a.finished && !a.writing;
}

function ae(a, b) {
  var c = Wd(b);
  c && (0 === b.pendingcb ? (b.prefinished || (b.prefinished = !0, a.emit("prefinish")), b.finished = !0, a.emit("finish")) : b.prefinished || (b.prefinished = !0, a.emit("prefinish")));
  return c;
}

function Zd(a) {
  var b = this;
  this.entry = this.next = null;

  this.finish = function (c) {
    var d = b.entry;

    for (b.entry = null; d;) {
      var e = d.callback;
      a.pendingcb--;
      e(c);
      d = d.next;
    }

    a.corkedRequestsFree ? a.corkedRequestsFree.next = b : a.corkedRequestsFree = b;
  };
}

Db(V, P);

for (var be = Object.keys(W.prototype), ce = 0; ce < be.length; ce++) {
  var de = be[ce];
  V.prototype[de] || (V.prototype[de] = W.prototype[de]);
}

function V(a) {
  if (!(this instanceof V)) return new V(a);
  P.call(this, a);
  W.call(this, a);
  a && !1 === a.readable && (this.readable = !1);
  a && !1 === a.writable && (this.writable = !1);
  this.allowHalfOpen = !0;
  a && !1 === a.allowHalfOpen && (this.allowHalfOpen = !1);
  this.once("end", ee);
}

function ee() {
  this.allowHalfOpen || this._writableState.ended || G(fe, this);
}

function fe(a) {
  a.end();
}

Db(X, V);

function ge(a) {
  this.afterTransform = function (b, c) {
    var d = a._transformState;
    d.transforming = !1;
    var e = d.writecb;
    e ? (d.writechunk = null, d.writecb = null, null !== c && void 0 !== c && a.push(c), e(b), b = a._readableState, b.reading = !1, (b.needReadable || b.length < b.highWaterMark) && a._read(b.highWaterMark), b = void 0) : b = a.emit("error", Error("no writecb in Transform class"));
    return b;
  };

  this.transforming = this.needTransform = !1;
  this.writeencoding = this.writechunk = this.writecb = null;
}

function X(a) {
  if (!(this instanceof X)) return new X(a);
  V.call(this, a);
  this._transformState = new ge(this);
  var b = this;
  this._readableState.needReadable = !0;
  this._readableState.sync = !1;
  a && ("function" === typeof a.transform && (this._transform = a.transform), "function" === typeof a.flush && (this._flush = a.flush));
  this.once("prefinish", function () {
    "function" === typeof this._flush ? this._flush(function (a) {
      he(b, a);
    }) : he(b);
  });
}

X.prototype.push = function (a, b) {
  this._transformState.needTransform = !1;
  return V.prototype.push.call(this, a, b);
};

X.prototype._transform = function () {
  throw Error("Not implemented");
};

X.prototype._write = function (a, b, c) {
  var d = this._transformState;
  d.writecb = c;
  d.writechunk = a;
  d.writeencoding = b;
  d.transforming || (a = this._readableState, (d.needTransform || a.needReadable || a.length < a.highWaterMark) && this._read(a.highWaterMark));
};

X.prototype._read = function () {
  var a = this._transformState;
  null !== a.writechunk && a.writecb && !a.transforming ? (a.transforming = !0, this._transform(a.writechunk, a.writeencoding, a.afterTransform)) : a.needTransform = !0;
};

function he(a, b) {
  if (b) return a.emit("error", b);
  b = a._transformState;
  if (a._writableState.length) throw Error("Calling transform done when ws.length != 0");
  if (b.transforming) throw Error("Calling transform done when still transforming");
  return a.push(null);
}

Db(ie, X);

function ie(a) {
  if (!(this instanceof ie)) return new ie(a);
  X.call(this, a);
}

ie.prototype._transform = function (a, b, c) {
  c(null, a);
};

Db(Y, O);
Y.Readable = P;
Y.Writable = W;
Y.Duplex = V;
Y.Transform = X;
Y.PassThrough = ie;
Y.Stream = Y;

function Y() {
  O.call(this);
}

Y.prototype.pipe = function (a, b) {
  function c(b) {
    a.writable && !1 === a.write(b) && k.pause && k.pause();
  }

  function d() {
    k.readable && k.resume && k.resume();
  }

  function e() {
    p || (p = !0, a.end());
  }

  function f() {
    p || (p = !0, "function" === typeof a.destroy && a.destroy());
  }

  function g(a) {
    h();
    if (0 === O.listenerCount(this, "error")) throw a;
  }

  function h() {
    k.removeListener("data", c);
    a.removeListener("drain", d);
    k.removeListener("end", e);
    k.removeListener("close", f);
    k.removeListener("error", g);
    a.removeListener("error", g);
    k.removeListener("end", h);
    k.removeListener("close", h);
    a.removeListener("close", h);
  }

  var k = this;
  k.on("data", c);
  a.on("drain", d);
  a._isStdio || b && !1 === b.end || (k.on("end", e), k.on("close", f));
  var p = !1;
  k.on("error", g);
  a.on("error", g);
  k.on("end", h);
  k.on("close", h);
  a.on("close", h);
  a.emit("pipe", k);
  return a;
};

var je = Array.prototype.slice,
    le = {
  extend: function ke(a, b) {
    for (var d in b) a[d] = b[d];

    return 3 > arguments.length ? a : ke.apply(null, [a].concat(je.call(arguments, 2)));
  }
},
    me = u(function (a, b) {
  function c(a, b, c) {
    void 0 === c && (c = function (a) {
      return a;
    });
    return function () {
      for (var e = [], f = 0; f < arguments.length; f++) e[f] = arguments[f];

      return new Promise(function (f, g) {
        a[b].bind(a).apply(void 0, d(e, [function (a, b) {
          return a ? g(a) : f(c(b));
        }]));
      });
    };
  }

  var d = l && l.__spreadArrays || function () {
    for (var a = 0, b = 0, c = arguments.length; b < c; b++) a += arguments[b].length;

    a = Array(a);
    var d = 0;

    for (b = 0; b < c; b++) for (var e = arguments[b], n = 0, q = e.length; n < q; n++, d++) a[d] = e[n];

    return a;
  };

  Object.defineProperty(b, "__esModule", {
    value: !0
  });

  var e = function () {
    function a(a, b) {
      this.vol = a;
      this.fd = b;
    }

    a.prototype.appendFile = function (a, b) {
      return c(this.vol, "appendFile")(this.fd, a, b);
    };

    a.prototype.chmod = function (a) {
      return c(this.vol, "fchmod")(this.fd, a);
    };

    a.prototype.chown = function (a, b) {
      return c(this.vol, "fchown")(this.fd, a, b);
    };

    a.prototype.close = function () {
      return c(this.vol, "close")(this.fd);
    };

    a.prototype.datasync = function () {
      return c(this.vol, "fdatasync")(this.fd);
    };

    a.prototype.read = function (a, b, d, e) {
      return c(this.vol, "read", function (b) {
        return {
          bytesRead: b,
          buffer: a
        };
      })(this.fd, a, b, d, e);
    };

    a.prototype.readFile = function (a) {
      return c(this.vol, "readFile")(this.fd, a);
    };

    a.prototype.stat = function (a) {
      return c(this.vol, "fstat")(this.fd, a);
    };

    a.prototype.sync = function () {
      return c(this.vol, "fsync")(this.fd);
    };

    a.prototype.truncate = function (a) {
      return c(this.vol, "ftruncate")(this.fd, a);
    };

    a.prototype.utimes = function (a, b) {
      return c(this.vol, "futimes")(this.fd, a, b);
    };

    a.prototype.write = function (a, b, d, e) {
      return c(this.vol, "write", function (b) {
        return {
          bytesWritten: b,
          buffer: a
        };
      })(this.fd, a, b, d, e);
    };

    a.prototype.writeFile = function (a, b) {
      return c(this.vol, "writeFile")(this.fd, a, b);
    };

    return a;
  }();

  b.FileHandle = e;

  b.default = function (a) {
    return "undefined" === typeof Promise ? null : {
      FileHandle: e,
      access: function (b, d) {
        return c(a, "access")(b, d);
      },
      appendFile: function (b, d, f) {
        return c(a, "appendFile")(b instanceof e ? b.fd : b, d, f);
      },
      chmod: function (b, d) {
        return c(a, "chmod")(b, d);
      },
      chown: function (b, d, e) {
        return c(a, "chown")(b, d, e);
      },
      copyFile: function (b, d, e) {
        return c(a, "copyFile")(b, d, e);
      },
      lchmod: function (b, d) {
        return c(a, "lchmod")(b, d);
      },
      lchown: function (b, d, e) {
        return c(a, "lchown")(b, d, e);
      },
      link: function (b, d) {
        return c(a, "link")(b, d);
      },
      lstat: function (b, d) {
        return c(a, "lstat")(b, d);
      },
      mkdir: function (b, d) {
        return c(a, "mkdir")(b, d);
      },
      mkdtemp: function (b, d) {
        return c(a, "mkdtemp")(b, d);
      },
      open: function (b, d, f) {
        return c(a, "open", function (b) {
          return new e(a, b);
        })(b, d, f);
      },
      readdir: function (b, d) {
        return c(a, "readdir")(b, d);
      },
      readFile: function (b, d) {
        return c(a, "readFile")(b instanceof e ? b.fd : b, d);
      },
      readlink: function (b, d) {
        return c(a, "readlink")(b, d);
      },
      realpath: function (b, d) {
        return c(a, "realpath")(b, d);
      },
      rename: function (b, d) {
        return c(a, "rename")(b, d);
      },
      rmdir: function (b) {
        return c(a, "rmdir")(b);
      },
      stat: function (b, d) {
        return c(a, "stat")(b, d);
      },
      symlink: function (b, d, e) {
        return c(a, "symlink")(b, d, e);
      },
      truncate: function (b, d) {
        return c(a, "truncate")(b, d);
      },
      unlink: function (b) {
        return c(a, "unlink")(b);
      },
      utimes: function (b, d, e) {
        return c(a, "utimes")(b, d, e);
      },
      writeFile: function (b, d, f) {
        return c(a, "writeFile")(b instanceof e ? b.fd : b, d, f);
      }
    };
  };
});
t(me);
var ne = /[^\x20-\x7E]/,
    oe = /[\x2E\u3002\uFF0E\uFF61]/g,
    pe = {
  overflow: "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
},
    qe = Math.floor,
    re = String.fromCharCode;

function se(a, b) {
  var c = a.split("@"),
      d = "";
  1 < c.length && (d = c[0] + "@", a = c[1]);
  a = a.replace(oe, ".");
  a = a.split(".");
  c = a.length;

  for (var e = []; c--;) e[c] = b(a[c]);

  b = e.join(".");
  return d + b;
}

function te(a, b) {
  return a + 22 + 75 * (26 > a) - ((0 != b) << 5);
}

function ue(a) {
  return se(a, function (a) {
    if (ne.test(a)) {
      var b;
      var d = [];
      var e = [];
      var f = 0;

      for (b = a.length; f < b;) {
        var g = a.charCodeAt(f++);

        if (55296 <= g && 56319 >= g && f < b) {
          var h = a.charCodeAt(f++);
          56320 == (h & 64512) ? e.push(((g & 1023) << 10) + (h & 1023) + 65536) : (e.push(g), f--);
        } else e.push(g);
      }

      a = e;
      h = a.length;
      e = 128;
      var k = 0;
      var p = 72;

      for (g = 0; g < h; ++g) {
        var n = a[g];
        128 > n && d.push(re(n));
      }

      for ((f = b = d.length) && d.push("-"); f < h;) {
        var q = 2147483647;

        for (g = 0; g < h; ++g) n = a[g], n >= e && n < q && (q = n);

        var B = f + 1;
        if (q - e > qe((2147483647 - k) / B)) throw new RangeError(pe.overflow);
        k += (q - e) * B;
        e = q;

        for (g = 0; g < h; ++g) {
          n = a[g];
          if (n < e && 2147483647 < ++k) throw new RangeError(pe.overflow);

          if (n == e) {
            var m = k;

            for (q = 36;; q += 36) {
              n = q <= p ? 1 : q >= p + 26 ? 26 : q - p;
              if (m < n) break;
              var v = m - n;
              m = 36 - n;
              d.push(re(te(n + v % m, 0)));
              m = qe(v / m);
            }

            d.push(re(te(m, 0)));
            p = B;
            q = 0;
            k = f == b ? qe(k / 700) : k >> 1;

            for (k += qe(k / p); 455 < k; q += 36) k = qe(k / 35);

            p = qe(q + 36 * k / (k + 38));
            k = 0;
            ++f;
          }
        }

        ++k;
        ++e;
      }

      d = "xn--" + d.join("");
    } else d = a;

    return d;
  });
}

var ve = Array.isArray || function (a) {
  return "[object Array]" === Object.prototype.toString.call(a);
};

function we(a) {
  switch (typeof a) {
    case "string":
      return a;

    case "boolean":
      return a ? "true" : "false";

    case "number":
      return isFinite(a) ? a : "";

    default:
      return "";
  }
}

function xe(a, b, c, d) {
  b = b || "&";
  c = c || "=";
  null === a && (a = void 0);
  return "object" === typeof a ? ye(ze(a), function (d) {
    var e = encodeURIComponent(we(d)) + c;
    return ve(a[d]) ? ye(a[d], function (a) {
      return e + encodeURIComponent(we(a));
    }).join(b) : e + encodeURIComponent(we(a[d]));
  }).join(b) : d ? encodeURIComponent(we(d)) + c + encodeURIComponent(we(a)) : "";
}

function ye(a, b) {
  if (a.map) return a.map(b);

  for (var c = [], d = 0; d < a.length; d++) c.push(b(a[d], d));

  return c;
}

var ze = Object.keys || function (a) {
  var b = [],
      c;

  for (c in a) Object.prototype.hasOwnProperty.call(a, c) && b.push(c);

  return b;
};

function Ae(a, b, c, d) {
  c = c || "=";
  var e = {};
  if ("string" !== typeof a || 0 === a.length) return e;
  var f = /\+/g;
  a = a.split(b || "&");
  b = 1E3;
  d && "number" === typeof d.maxKeys && (b = d.maxKeys);
  d = a.length;
  0 < b && d > b && (d = b);

  for (b = 0; b < d; ++b) {
    var g = a[b].replace(f, "%20"),
        h = g.indexOf(c);

    if (0 <= h) {
      var k = g.substr(0, h);
      g = g.substr(h + 1);
    } else k = g, g = "";

    k = decodeURIComponent(k);
    g = decodeURIComponent(g);
    Object.prototype.hasOwnProperty.call(e, k) ? ve(e[k]) ? e[k].push(g) : e[k] = [e[k], g] : e[k] = g;
  }

  return e;
}

var Fe = {
  parse: Be,
  resolve: Ce,
  resolveObject: De,
  format: Ee,
  Url: Z
};

function Z() {
  this.href = this.path = this.pathname = this.query = this.search = this.hash = this.hostname = this.port = this.host = this.auth = this.slashes = this.protocol = null;
}

var Ge = /^([a-z0-9.+-]+:)/i,
    He = /:[0-9]*$/,
    Ie = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
    Je = "{}|\\^`".split("").concat('<>"` \r\n\t'.split("")),
    Ke = ["'"].concat(Je),
    Le = ["%", "/", "?", ";", "#"].concat(Ke),
    Me = ["/", "?", "#"],
    Ne = 255,
    Oe = /^[+a-z0-9A-Z_-]{0,63}$/,
    Pe = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    Qe = {
  javascript: !0,
  "javascript:": !0
},
    Re = {
  javascript: !0,
  "javascript:": !0
},
    Se = {
  http: !0,
  https: !0,
  ftp: !0,
  gopher: !0,
  file: !0,
  "http:": !0,
  "https:": !0,
  "ftp:": !0,
  "gopher:": !0,
  "file:": !0
};

function Be(a, b, c) {
  if (a && Hb(a) && a instanceof Z) return a;
  var d = new Z();
  d.parse(a, b, c);
  return d;
}

Z.prototype.parse = function (a, b, c) {
  return Te(this, a, b, c);
};

function Te(a, b, c, d) {
  if (!Gb(b)) throw new TypeError("Parameter 'url' must be a string, not " + typeof b);
  var e = b.indexOf("?");
  e = -1 !== e && e < b.indexOf("#") ? "?" : "#";
  b = b.split(e);
  b[0] = b[0].replace(/\\/g, "/");
  b = b.join(e);
  e = b.trim();
  if (!d && 1 === b.split("#").length && (b = Ie.exec(e))) return a.path = e, a.href = e, a.pathname = b[1], b[2] ? (a.search = b[2], a.query = c ? Ae(a.search.substr(1)) : a.search.substr(1)) : c && (a.search = "", a.query = {}), a;

  if (b = Ge.exec(e)) {
    b = b[0];
    var f = b.toLowerCase();
    a.protocol = f;
    e = e.substr(b.length);
  }

  if (d || b || e.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var g = "//" === e.substr(0, 2);
    !g || b && Re[b] || (e = e.substr(2), a.slashes = !0);
  }

  if (!Re[b] && (g || b && !Se[b])) {
    b = -1;

    for (d = 0; d < Me.length; d++) g = e.indexOf(Me[d]), -1 !== g && (-1 === b || g < b) && (b = g);

    g = -1 === b ? e.lastIndexOf("@") : e.lastIndexOf("@", b);
    -1 !== g && (d = e.slice(0, g), e = e.slice(g + 1), a.auth = decodeURIComponent(d));
    b = -1;

    for (d = 0; d < Le.length; d++) g = e.indexOf(Le[d]), -1 !== g && (-1 === b || g < b) && (b = g);

    -1 === b && (b = e.length);
    a.host = e.slice(0, b);
    e = e.slice(b);
    Ue(a);
    a.hostname = a.hostname || "";
    g = "[" === a.hostname[0] && "]" === a.hostname[a.hostname.length - 1];

    if (!g) {
      var h = a.hostname.split(/\./);
      d = 0;

      for (b = h.length; d < b; d++) {
        var k = h[d];

        if (k && !k.match(Oe)) {
          for (var p = "", n = 0, q = k.length; n < q; n++) p = 127 < k.charCodeAt(n) ? p + "x" : p + k[n];

          if (!p.match(Oe)) {
            b = h.slice(0, d);
            d = h.slice(d + 1);
            if (k = k.match(Pe)) b.push(k[1]), d.unshift(k[2]);
            d.length && (e = "/" + d.join(".") + e);
            a.hostname = b.join(".");
            break;
          }
        }
      }
    }

    a.hostname = a.hostname.length > Ne ? "" : a.hostname.toLowerCase();
    g || (a.hostname = ue(a.hostname));
    d = a.port ? ":" + a.port : "";
    a.host = (a.hostname || "") + d;
    a.href += a.host;
    g && (a.hostname = a.hostname.substr(1, a.hostname.length - 2), "/" !== e[0] && (e = "/" + e));
  }

  if (!Qe[f]) for (d = 0, b = Ke.length; d < b; d++) g = Ke[d], -1 !== e.indexOf(g) && (k = encodeURIComponent(g), k === g && (k = escape(g)), e = e.split(g).join(k));
  d = e.indexOf("#");
  -1 !== d && (a.hash = e.substr(d), e = e.slice(0, d));
  d = e.indexOf("?");
  -1 !== d ? (a.search = e.substr(d), a.query = e.substr(d + 1), c && (a.query = Ae(a.query)), e = e.slice(0, d)) : c && (a.search = "", a.query = {});
  e && (a.pathname = e);
  Se[f] && a.hostname && !a.pathname && (a.pathname = "/");
  if (a.pathname || a.search) d = a.pathname || "", a.path = d + (a.search || "");
  a.href = Ve(a);
  return a;
}

function Ee(a) {
  Gb(a) && (a = Te({}, a));
  return Ve(a);
}

function Ve(a) {
  var b = a.auth || "";
  b && (b = encodeURIComponent(b), b = b.replace(/%3A/i, ":"), b += "@");
  var c = a.protocol || "",
      d = a.pathname || "",
      e = a.hash || "",
      f = !1,
      g = "";
  a.host ? f = b + a.host : a.hostname && (f = b + (-1 === a.hostname.indexOf(":") ? a.hostname : "[" + this.hostname + "]"), a.port && (f += ":" + a.port));
  a.query && Hb(a.query) && Object.keys(a.query).length && (g = xe(a.query));
  b = a.search || g && "?" + g || "";
  c && ":" !== c.substr(-1) && (c += ":");
  a.slashes || (!c || Se[c]) && !1 !== f ? (f = "//" + (f || ""), d && "/" !== d.charAt(0) && (d = "/" + d)) : f || (f = "");
  e && "#" !== e.charAt(0) && (e = "#" + e);
  b && "?" !== b.charAt(0) && (b = "?" + b);
  d = d.replace(/[?#]/g, function (a) {
    return encodeURIComponent(a);
  });
  b = b.replace("#", "%23");
  return c + f + d + b + e;
}

Z.prototype.format = function () {
  return Ve(this);
};

function Ce(a, b) {
  return Be(a, !1, !0).resolve(b);
}

Z.prototype.resolve = function (a) {
  return this.resolveObject(Be(a, !1, !0)).format();
};

function De(a, b) {
  return a ? Be(a, !1, !0).resolveObject(b) : b;
}

Z.prototype.resolveObject = function (a) {
  if (Gb(a)) {
    var b = new Z();
    b.parse(a, !1, !0);
    a = b;
  }

  b = new Z();

  for (var c = Object.keys(this), d = 0; d < c.length; d++) {
    var e = c[d];
    b[e] = this[e];
  }

  b.hash = a.hash;
  if ("" === a.href) return b.href = b.format(), b;

  if (a.slashes && !a.protocol) {
    c = Object.keys(a);

    for (d = 0; d < c.length; d++) e = c[d], "protocol" !== e && (b[e] = a[e]);

    Se[b.protocol] && b.hostname && !b.pathname && (b.path = b.pathname = "/");
    b.href = b.format();
    return b;
  }

  var f;

  if (a.protocol && a.protocol !== b.protocol) {
    if (!Se[a.protocol]) {
      c = Object.keys(a);

      for (d = 0; d < c.length; d++) e = c[d], b[e] = a[e];

      b.href = b.format();
      return b;
    }

    b.protocol = a.protocol;
    if (a.host || Re[a.protocol]) b.pathname = a.pathname;else {
      for (f = (a.pathname || "").split("/"); f.length && !(a.host = f.shift()););

      a.host || (a.host = "");
      a.hostname || (a.hostname = "");
      "" !== f[0] && f.unshift("");
      2 > f.length && f.unshift("");
      b.pathname = f.join("/");
    }
    b.search = a.search;
    b.query = a.query;
    b.host = a.host || "";
    b.auth = a.auth;
    b.hostname = a.hostname || a.host;
    b.port = a.port;
    if (b.pathname || b.search) b.path = (b.pathname || "") + (b.search || "");
    b.slashes = b.slashes || a.slashes;
    b.href = b.format();
    return b;
  }

  c = b.pathname && "/" === b.pathname.charAt(0);
  var g = a.host || a.pathname && "/" === a.pathname.charAt(0),
      h = c = g || c || b.host && a.pathname;
  d = b.pathname && b.pathname.split("/") || [];
  e = b.protocol && !Se[b.protocol];
  f = a.pathname && a.pathname.split("/") || [];
  e && (b.hostname = "", b.port = null, b.host && ("" === d[0] ? d[0] = b.host : d.unshift(b.host)), b.host = "", a.protocol && (a.hostname = null, a.port = null, a.host && ("" === f[0] ? f[0] = a.host : f.unshift(a.host)), a.host = null), c = c && ("" === f[0] || "" === d[0]));
  if (g) b.host = a.host || "" === a.host ? a.host : b.host, b.hostname = a.hostname || "" === a.hostname ? a.hostname : b.hostname, b.search = a.search, b.query = a.query, d = f;else if (f.length) d || (d = []), d.pop(), d = d.concat(f), b.search = a.search, b.query = a.query;else if (null != a.search) {
    e && (b.hostname = b.host = d.shift(), e = b.host && 0 < b.host.indexOf("@") ? b.host.split("@") : !1) && (b.auth = e.shift(), b.host = b.hostname = e.shift());
    b.search = a.search;
    b.query = a.query;
    if (null !== b.pathname || null !== b.search) b.path = (b.pathname ? b.pathname : "") + (b.search ? b.search : "");
    b.href = b.format();
    return b;
  }
  if (!d.length) return b.pathname = null, b.path = b.search ? "/" + b.search : null, b.href = b.format(), b;
  g = d.slice(-1)[0];
  f = (b.host || a.host || 1 < d.length) && ("." === g || ".." === g) || "" === g;

  for (var k = 0, p = d.length; 0 <= p; p--) g = d[p], "." === g ? d.splice(p, 1) : ".." === g ? (d.splice(p, 1), k++) : k && (d.splice(p, 1), k--);

  if (!c && !h) for (; k--; k) d.unshift("..");
  !c || "" === d[0] || d[0] && "/" === d[0].charAt(0) || d.unshift("");
  f && "/" !== d.join("/").substr(-1) && d.push("");
  h = "" === d[0] || d[0] && "/" === d[0].charAt(0);
  e && (b.hostname = b.host = h ? "" : d.length ? d.shift() : "", e = b.host && 0 < b.host.indexOf("@") ? b.host.split("@") : !1) && (b.auth = e.shift(), b.host = b.hostname = e.shift());
  (c = c || b.host && d.length) && !h && d.unshift("");
  d.length ? b.pathname = d.join("/") : (b.pathname = null, b.path = null);
  if (null !== b.pathname || null !== b.search) b.path = (b.pathname ? b.pathname : "") + (b.search ? b.search : "");
  b.auth = a.auth || b.auth;
  b.slashes = b.slashes || a.slashes;
  b.href = b.format();
  return b;
};

Z.prototype.parseHost = function () {
  return Ue(this);
};

function Ue(a) {
  var b = a.host,
      c = He.exec(b);
  c && (c = c[0], ":" !== c && (a.port = c.substr(1)), b = b.substr(0, b.length - c.length));
  b && (a.hostname = b);
}

var We = u(function (a, b) {
  function c(a, b) {
    a = a[b];
    return 0 < b && ("/" === a || e && "\\" === a);
  }

  function d(a) {
    var b = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : !0;

    if (e) {
      var d = a;
      if ("string" !== typeof d) throw new TypeError("expected a string");
      d = d.replace(/[\\\/]+/g, "/");
      if (!1 !== b) if (b = d, d = b.length - 1, 2 > d) d = b;else {
        for (; c(b, d);) d--;

        d = b.substr(0, d + 1);
      }
      return d.replace(/^([a-zA-Z]+:|\.\/)/, "");
    }

    return a;
  }

  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  b.unixify = d;

  b.correctPath = function (a) {
    return d(a.replace(/^\\\\\?\\.:\\/, "\\"));
  };

  var e = "win32" === Cb.platform;
});
t(We);
var Xe = u(function (a, b) {
  function c(a, b) {
    void 0 === b && (b = L.default.cwd());
    return cf(b, a);
  }

  function d(a, b) {
    return "function" === typeof a ? [e(), a] : [e(a), q(b)];
  }

  function e(a) {
    void 0 === a && (a = {});
    return aa({}, df, a);
  }

  function f(a) {
    return "number" === typeof a ? aa({}, ud, {
      mode: a
    }) : aa({}, ud, a);
  }

  function g(a, b, c, d) {
    void 0 === b && (b = "");
    void 0 === c && (c = "");
    void 0 === d && (d = "");
    var e = "";
    c && (e = " '" + c + "'");
    d && (e += " -> '" + d + "'");

    switch (a) {
      case "ENOENT":
        return "ENOENT: no such file or directory, " + b + e;

      case "EBADF":
        return "EBADF: bad file descriptor, " + b + e;

      case "EINVAL":
        return "EINVAL: invalid argument, " + b + e;

      case "EPERM":
        return "EPERM: operation not permitted, " + b + e;

      case "EPROTO":
        return "EPROTO: protocol error, " + b + e;

      case "EEXIST":
        return "EEXIST: file already exists, " + b + e;

      case "ENOTDIR":
        return "ENOTDIR: not a directory, " + b + e;

      case "EISDIR":
        return "EISDIR: illegal operation on a directory, " + b + e;

      case "EACCES":
        return "EACCES: permission denied, " + b + e;

      case "ENOTEMPTY":
        return "ENOTEMPTY: directory not empty, " + b + e;

      case "EMFILE":
        return "EMFILE: too many open files, " + b + e;

      case "ENOSYS":
        return "ENOSYS: function not implemented, " + b + e;

      default:
        return a + ": error occurred, " + b + e;
    }
  }

  function h(a, b, c, d, e) {
    void 0 === b && (b = "");
    void 0 === c && (c = "");
    void 0 === d && (d = "");
    void 0 === e && (e = Error);
    b = new e(g(a, b, c, d));
    b.code = a;
    return b;
  }

  function k(a) {
    if ("number" === typeof a) return a;

    if ("string" === typeof a) {
      var b = ua[a];
      if ("undefined" !== typeof b) return b;
    }

    throw new Pc.TypeError("ERR_INVALID_OPT_VALUE", "flags", a);
  }

  function p(a, b) {
    if (b) {
      var c = typeof b;

      switch (c) {
        case "string":
          a = aa({}, a, {
            encoding: b
          });
          break;

        case "object":
          a = aa({}, a, b);
          break;

        default:
          throw TypeError("Expected options to be either an object or a string, but got " + c + " instead");
      }
    } else return a;

    "buffer" !== a.encoding && K.assertEncoding(a.encoding);
    return a;
  }

  function n(a) {
    return function (b) {
      return p(a, b);
    };
  }

  function q(a) {
    if ("function" !== typeof a) throw TypeError(fa.CB);
    return a;
  }

  function B(a) {
    return function (b, c) {
      return "function" === typeof b ? [a(), b] : [a(b), q(c)];
    };
  }

  function m(a) {
    if ("string" !== typeof a && !F.Buffer.isBuffer(a)) {
      try {
        if (!(a instanceof Fe.URL)) throw new TypeError(fa.PATH_STR);
      } catch (Xa) {
        throw new TypeError(fa.PATH_STR);
      }

      if ("" !== a.hostname) throw new Pc.TypeError("ERR_INVALID_FILE_URL_HOST", L.default.platform);
      a = a.pathname;

      for (var b = 0; b < a.length; b++) if ("%" === a[b]) {
        var c = a.codePointAt(b + 2) | 32;
        if ("2" === a[b + 1] && 102 === c) throw new Pc.TypeError("ERR_INVALID_FILE_URL_PATH", "must not include encoded / characters");
      }

      a = decodeURIComponent(a);
    }

    a = String(a);
    qb(a);
    return a;
  }

  function v(a, b) {
    return (a = c(a, b).substr(1)) ? a.split(S) : [];
  }

  function xa(a) {
    return v(m(a));
  }

  function La(a, b) {
    void 0 === b && (b = K.ENCODING_UTF8);
    return F.Buffer.isBuffer(a) ? a : a instanceof Uint8Array ? F.bufferFrom(a) : F.bufferFrom(String(a), b);
  }

  function $b(a, b) {
    return b && "buffer" !== b ? a.toString(b) : a;
  }

  function qb(a, b) {
    if (-1 !== ("" + a).indexOf("\x00")) {
      a = Error("Path must be a string without null bytes");
      a.code = "ENOENT";
      if ("function" !== typeof b) throw a;
      L.default.nextTick(b, a);
      return !1;
    }

    return !0;
  }

  function M(a, b) {
    a = "number" === typeof a ? a : "string" === typeof a ? parseInt(a, 8) : b ? M(b) : void 0;
    if ("number" !== typeof a || isNaN(a)) throw new TypeError(fa.MODE_INT);
    return a;
  }

  function Ya(a) {
    if (a >>> 0 !== a) throw TypeError(fa.FD);
  }

  function ha(a) {
    if ("string" === typeof a && +a == a) return +a;
    if (a instanceof Date) return a.getTime() / 1E3;
    if (isFinite(a)) return 0 > a ? Date.now() / 1E3 : a;
    throw Error("Cannot parse time: " + a);
  }

  function Ha(a) {
    if ("number" !== typeof a) throw TypeError(fa.UID);
  }

  function Ia(a) {
    if ("number" !== typeof a) throw TypeError(fa.GID);
  }

  function ef(a) {
    a.emit("stop");
  }

  function T(a, b, c) {
    if (!(this instanceof T)) return new T(a, b, c);
    this._vol = a;
    c = aa({}, p(c, {}));
    void 0 === c.highWaterMark && (c.highWaterMark = 65536);
    Y.Readable.call(this, c);
    this.path = m(b);
    this.fd = void 0 === c.fd ? null : c.fd;
    this.flags = void 0 === c.flags ? "r" : c.flags;
    this.mode = void 0 === c.mode ? 438 : c.mode;
    this.start = c.start;
    this.end = c.end;
    this.autoClose = void 0 === c.autoClose ? !0 : c.autoClose;
    this.pos = void 0;
    this.bytesRead = 0;

    if (void 0 !== this.start) {
      if ("number" !== typeof this.start) throw new TypeError('"start" option must be a Number');
      if (void 0 === this.end) this.end = Infinity;else if ("number" !== typeof this.end) throw new TypeError('"end" option must be a Number');
      if (this.start > this.end) throw Error('"start" option must be <= "end" option');
      this.pos = this.start;
    }

    "number" !== typeof this.fd && this.open();
    this.on("end", function () {
      this.autoClose && this.destroy && this.destroy();
    });
  }

  function ff() {
    this.close();
  }

  function R(a, b, c) {
    if (!(this instanceof R)) return new R(a, b, c);
    this._vol = a;
    c = aa({}, p(c, {}));
    Y.Writable.call(this, c);
    this.path = m(b);
    this.fd = void 0 === c.fd ? null : c.fd;
    this.flags = void 0 === c.flags ? "w" : c.flags;
    this.mode = void 0 === c.mode ? 438 : c.mode;
    this.start = c.start;
    this.autoClose = void 0 === c.autoClose ? !0 : !!c.autoClose;
    this.pos = void 0;
    this.bytesWritten = 0;

    if (void 0 !== this.start) {
      if ("number" !== typeof this.start) throw new TypeError('"start" option must be a Number');
      if (0 > this.start) throw Error('"start" must be >= zero');
      this.pos = this.start;
    }

    c.encoding && this.setDefaultEncoding(c.encoding);
    "number" !== typeof this.fd && this.open();
    this.once("finish", function () {
      this.autoClose && this.close();
    });
  }

  var Ja = l && l.__extends || function () {
    function a(b, c) {
      a = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (a, b) {
        a.__proto__ = b;
      } || function (a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
      };

      return a(b, c);
    }

    return function (b, c) {
      function d() {
        this.constructor = b;
      }

      a(b, c);
      b.prototype = null === c ? Object.create(c) : (d.prototype = c.prototype, new d());
    };
  }(),
      Xb = l && l.__spreadArrays || function () {
    for (var a = 0, b = 0, c = arguments.length; b < c; b++) a += arguments[b].length;

    a = Array(a);
    var d = 0;

    for (b = 0; b < c; b++) for (var e = arguments[b], f = 0, g = e.length; f < g; f++, d++) a[d] = e[f];

    return a;
  };

  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  var aa = le.extend,
      cf = Zc.resolve,
      mb = w.constants.O_RDONLY,
      Ka = w.constants.O_WRONLY,
      na = w.constants.O_RDWR,
      U = w.constants.O_CREAT,
      nb = w.constants.O_EXCL,
      Za = w.constants.O_TRUNC,
      $a = w.constants.O_APPEND,
      vd = w.constants.O_SYNC,
      gf = w.constants.O_DIRECTORY,
      wd = w.constants.F_OK,
      hf = w.constants.COPYFILE_EXCL,
      jf = w.constants.COPYFILE_FICLONE_FORCE;
  var S = Zc.sep;
  var xd = Zc.relative;
  var Yb = "win32" === L.default.platform,
      fa = {
    PATH_STR: "path must be a string or Buffer",
    FD: "fd must be a file descriptor",
    MODE_INT: "mode must be an int",
    CB: "callback must be a function",
    UID: "uid must be an unsigned int",
    GID: "gid must be an unsigned int",
    LEN: "len must be an integer",
    ATIME: "atime must be an integer",
    MTIME: "mtime must be an integer",
    PREFIX: "filename prefix is required",
    BUFFER: "buffer must be an instance of Buffer or StaticBuffer",
    OFFSET: "offset must be an integer",
    LENGTH: "length must be an integer",
    POSITION: "position must be an integer"
  },
      ua;

  (function (a) {
    a[a.r = mb] = "r";
    a[a["r+"] = na] = "r+";
    a[a.rs = mb | vd] = "rs";
    a[a.sr = a.rs] = "sr";
    a[a["rs+"] = na | vd] = "rs+";
    a[a["sr+"] = a["rs+"]] = "sr+";
    a[a.w = Ka | U | Za] = "w";
    a[a.wx = Ka | U | Za | nb] = "wx";
    a[a.xw = a.wx] = "xw";
    a[a["w+"] = na | U | Za] = "w+";
    a[a["wx+"] = na | U | Za | nb] = "wx+";
    a[a["xw+"] = a["wx+"]] = "xw+";
    a[a.a = Ka | $a | U] = "a";
    a[a.ax = Ka | $a | U | nb] = "ax";
    a[a.xa = a.ax] = "xa";
    a[a["a+"] = na | $a | U] = "a+";
    a[a["ax+"] = na | $a | U | nb] = "ax+";
    a[a["xa+"] = a["ax+"]] = "xa+";
  })(ua = b.FLAGS || (b.FLAGS = {}));

  b.flagsToNumber = k;
  a = {
    encoding: "utf8"
  };
  var ob = n(a),
      yd = B(ob),
      zd = n({
    flag: "r"
  }),
      Ad = {
    encoding: "utf8",
    mode: 438,
    flag: ua[ua.w]
  },
      Bd = n(Ad),
      Cd = {
    encoding: "utf8",
    mode: 438,
    flag: ua[ua.a]
  },
      Dd = n(Cd),
      kf = B(Dd),
      Ed = n(a),
      lf = B(Ed),
      ud = {
    mode: 511,
    recursive: !1
  },
      Fd = {
    recursive: !1
  },
      Gd = n({
    encoding: "utf8",
    withFileTypes: !1
  }),
      mf = B(Gd),
      df = {
    bigint: !1
  };
  b.pathToFilename = m;

  if (Yb) {
    var nf = c,
        of = We.unixify;

    c = function (a, b) {
      return of(nf(a, b));
    };
  }

  b.filenameToSteps = v;
  b.pathToSteps = xa;

  b.dataToStr = function (a, b) {
    void 0 === b && (b = K.ENCODING_UTF8);
    return F.Buffer.isBuffer(a) ? a.toString(b) : a instanceof Uint8Array ? F.bufferFrom(a).toString(b) : String(a);
  };

  b.dataToBuffer = La;
  b.bufferToEncoding = $b;
  b.toUnixTimestamp = ha;

  a = function () {
    function a(a) {
      void 0 === a && (a = {});
      this.ino = 0;
      this.inodes = {};
      this.releasedInos = [];
      this.fds = {};
      this.releasedFds = [];
      this.maxFiles = 1E4;
      this.openFiles = 0;
      this.promisesApi = me.default(this);
      this.statWatchers = {};
      this.props = aa({
        Node: fd.Node,
        Link: fd.Link,
        File: fd.File
      }, a);
      a = this.createLink();
      a.setNode(this.createNode(!0));
      var b = this;

      this.StatWatcher = function (a) {
        function c() {
          return a.call(this, b) || this;
        }

        Ja(c, a);
        return c;
      }(Hd);

      this.ReadStream = function (a) {
        function c() {
          for (var c = [], d = 0; d < arguments.length; d++) c[d] = arguments[d];

          return a.apply(this, Xb([b], c)) || this;
        }

        Ja(c, a);
        return c;
      }(T);

      this.WriteStream = function (a) {
        function c() {
          for (var c = [], d = 0; d < arguments.length; d++) c[d] = arguments[d];

          return a.apply(this, Xb([b], c)) || this;
        }

        Ja(c, a);
        return c;
      }(R);

      this.FSWatcher = function (a) {
        function c() {
          return a.call(this, b) || this;
        }

        Ja(c, a);
        return c;
      }(Id);

      this.root = a;
    }

    a.fromJSON = function (b, c) {
      var d = new a();
      d.fromJSON(b, c);
      return d;
    };

    Object.defineProperty(a.prototype, "promises", {
      get: function () {
        if (null === this.promisesApi) throw Error("Promise is not supported in this environment.");
        return this.promisesApi;
      },
      enumerable: !0,
      configurable: !0
    });

    a.prototype.createLink = function (a, b, c, d) {
      void 0 === c && (c = !1);
      if (!a) return new this.props.Link(this, null, "");
      if (!b) throw Error("createLink: name cannot be empty");
      return a.createChild(b, this.createNode(c, d));
    };

    a.prototype.deleteLink = function (a) {
      var b = a.parent;
      return b ? (b.deleteChild(a), !0) : !1;
    };

    a.prototype.newInoNumber = function () {
      var a = this.releasedInos.pop();
      return a ? a : this.ino = (this.ino + 1) % 4294967295;
    };

    a.prototype.newFdNumber = function () {
      var b = this.releasedFds.pop();
      return "number" === typeof b ? b : a.fd--;
    };

    a.prototype.createNode = function (a, b) {
      void 0 === a && (a = !1);
      b = new this.props.Node(this.newInoNumber(), b);
      a && b.setIsDirectory();
      return this.inodes[b.ino] = b;
    };

    a.prototype.getNode = function (a) {
      return this.inodes[a];
    };

    a.prototype.deleteNode = function (a) {
      a.del();
      delete this.inodes[a.ino];
      this.releasedInos.push(a.ino);
    };

    a.prototype.genRndStr = function () {
      var a = (Math.random() + 1).toString(36).substr(2, 6);
      return 6 === a.length ? a : this.genRndStr();
    };

    a.prototype.getLink = function (a) {
      return this.root.walk(a);
    };

    a.prototype.getLinkOrThrow = function (a, b) {
      var c = v(a);
      c = this.getLink(c);
      if (!c) throw h("ENOENT", b, a);
      return c;
    };

    a.prototype.getResolvedLink = function (a) {
      a = "string" === typeof a ? v(a) : a;

      for (var b = this.root, c = 0; c < a.length;) {
        b = b.getChild(a[c]);
        if (!b) return null;
        var d = b.getNode();
        d.isSymlink() ? (a = d.symlink.concat(a.slice(c + 1)), b = this.root, c = 0) : c++;
      }

      return b;
    };

    a.prototype.getResolvedLinkOrThrow = function (a, b) {
      var c = this.getResolvedLink(a);
      if (!c) throw h("ENOENT", b, a);
      return c;
    };

    a.prototype.resolveSymlinks = function (a) {
      return this.getResolvedLink(a.steps.slice(1));
    };

    a.prototype.getLinkAsDirOrThrow = function (a, b) {
      var c = this.getLinkOrThrow(a, b);
      if (!c.getNode().isDirectory()) throw h("ENOTDIR", b, a);
      return c;
    };

    a.prototype.getLinkParent = function (a) {
      return this.root.walk(a, a.length - 1);
    };

    a.prototype.getLinkParentAsDirOrThrow = function (a, b) {
      a = a instanceof Array ? a : v(a);
      var c = this.getLinkParent(a);
      if (!c) throw h("ENOENT", b, S + a.join(S));
      if (!c.getNode().isDirectory()) throw h("ENOTDIR", b, S + a.join(S));
      return c;
    };

    a.prototype.getFileByFd = function (a) {
      return this.fds[String(a)];
    };

    a.prototype.getFileByFdOrThrow = function (a, b) {
      if (a >>> 0 !== a) throw TypeError(fa.FD);
      a = this.getFileByFd(a);
      if (!a) throw h("EBADF", b);
      return a;
    };

    a.prototype.getNodeByIdOrCreate = function (a, b, c) {
      if ("number" === typeof a) {
        a = this.getFileByFd(a);
        if (!a) throw Error("File nto found");
        return a.node;
      }

      var d = xa(a),
          e = this.getLink(d);
      if (e) return e.getNode();
      if (b & U && (b = this.getLinkParent(d))) return e = this.createLink(b, d[d.length - 1], !1, c), e.getNode();
      throw h("ENOENT", "getNodeByIdOrCreate", m(a));
    };

    a.prototype.wrapAsync = function (a, b, c) {
      var d = this;
      q(c);
      $c.default(function () {
        try {
          c(null, a.apply(d, b));
        } catch (va) {
          c(va);
        }
      });
    };

    a.prototype._toJSON = function (a, b, c) {
      var d;
      void 0 === a && (a = this.root);
      void 0 === b && (b = {});
      var e = !0,
          r = a.children;
      a.getNode().isFile() && (r = (d = {}, d[a.getName()] = a.parent.getChild(a.getName()), d), a = a.parent);

      for (var D in r) {
        e = !1;
        r = a.getChild(D);
        if (!r) throw Error("_toJSON: unexpected undefined");
        d = r.getNode();
        d.isFile() ? (r = r.getPath(), c && (r = xd(c, r)), b[r] = d.getString()) : d.isDirectory() && this._toJSON(r, b, c);
      }

      a = a.getPath();
      c && (a = xd(c, a));
      a && e && (b[a] = null);
      return b;
    };

    a.prototype.toJSON = function (a, b, c) {
      void 0 === b && (b = {});
      void 0 === c && (c = !1);
      var d = [];

      if (a) {
        a instanceof Array || (a = [a]);

        for (var e = 0; e < a.length; e++) {
          var r = m(a[e]);
          (r = this.getResolvedLink(r)) && d.push(r);
        }
      } else d.push(this.root);

      if (!d.length) return b;

      for (e = 0; e < d.length; e++) r = d[e], this._toJSON(r, b, c ? r.getPath() : "");

      return b;
    };

    a.prototype.fromJSON = function (a, b) {
      void 0 === b && (b = L.default.cwd());

      for (var d in a) {
        var e = a[d];

        if ("string" === typeof e) {
          d = c(d, b);
          var r = v(d);
          1 < r.length && (r = S + r.slice(0, r.length - 1).join(S), this.mkdirpBase(r, 511));
          this.writeFileSync(d, e);
        } else this.mkdirpBase(d, 511);
      }
    };

    a.prototype.reset = function () {
      this.ino = 0;
      this.inodes = {};
      this.releasedInos = [];
      this.fds = {};
      this.releasedFds = [];
      this.openFiles = 0;
      this.root = this.createLink();
      this.root.setNode(this.createNode(!0));
    };

    a.prototype.mountSync = function (a, b) {
      this.fromJSON(b, a);
    };

    a.prototype.openLink = function (a, b, c) {
      void 0 === c && (c = !0);
      if (this.openFiles >= this.maxFiles) throw h("EMFILE", "open", a.getPath());
      var d = a;
      c && (d = this.resolveSymlinks(a));
      if (!d) throw h("ENOENT", "open", a.getPath());
      c = d.getNode();

      if (c.isDirectory()) {
        if ((b & (mb | na | Ka)) !== mb) throw h("EISDIR", "open", a.getPath());
      } else if (b & gf) throw h("ENOTDIR", "open", a.getPath());

      if (!(b & Ka || c.canRead())) throw h("EACCES", "open", a.getPath());
      a = new this.props.File(a, c, b, this.newFdNumber());
      this.fds[a.fd] = a;
      this.openFiles++;
      b & Za && a.truncate();
      return a;
    };

    a.prototype.openFile = function (a, b, c, d) {
      void 0 === d && (d = !0);
      var e = v(a),
          r = d ? this.getResolvedLink(e) : this.getLink(e);

      if (!r && b & U) {
        var D = this.getResolvedLink(e.slice(0, e.length - 1));
        if (!D) throw h("ENOENT", "open", S + e.join(S));
        b & U && "number" === typeof c && (r = this.createLink(D, e[e.length - 1], !1, c));
      }

      if (r) return this.openLink(r, b, d);
      throw h("ENOENT", "open", a);
    };

    a.prototype.openBase = function (a, b, c, d) {
      void 0 === d && (d = !0);
      b = this.openFile(a, b, c, d);
      if (!b) throw h("ENOENT", "open", a);
      return b.fd;
    };

    a.prototype.openSync = function (a, b, c) {
      void 0 === c && (c = 438);
      c = M(c);
      a = m(a);
      b = k(b);
      return this.openBase(a, b, c);
    };

    a.prototype.open = function (a, b, c, d) {
      var e = c;
      "function" === typeof c && (e = 438, d = c);
      c = M(e || 438);
      a = m(a);
      b = k(b);
      this.wrapAsync(this.openBase, [a, b, c], d);
    };

    a.prototype.closeFile = function (a) {
      this.fds[a.fd] && (this.openFiles--, delete this.fds[a.fd], this.releasedFds.push(a.fd));
    };

    a.prototype.closeSync = function (a) {
      Ya(a);
      a = this.getFileByFdOrThrow(a, "close");
      this.closeFile(a);
    };

    a.prototype.close = function (a, b) {
      Ya(a);
      this.wrapAsync(this.closeSync, [a], b);
    };

    a.prototype.openFileOrGetById = function (a, b, c) {
      if ("number" === typeof a) {
        a = this.fds[a];
        if (!a) throw h("ENOENT");
        return a;
      }

      return this.openFile(m(a), b, c);
    };

    a.prototype.readBase = function (a, b, c, d, e) {
      return this.getFileByFdOrThrow(a).read(b, Number(c), Number(d), e);
    };

    a.prototype.readSync = function (a, b, c, d, e) {
      Ya(a);
      return this.readBase(a, b, c, d, e);
    };

    a.prototype.read = function (a, b, c, d, e, f) {
      var r = this;
      q(f);
      if (0 === d) return L.default.nextTick(function () {
        f && f(null, 0, b);
      });
      $c.default(function () {
        try {
          var D = r.readBase(a, b, c, d, e);
          f(null, D, b);
        } catch (pf) {
          f(pf);
        }
      });
    };

    a.prototype.readFileBase = function (a, b, c) {
      var d = "number" === typeof a && a >>> 0 === a;

      if (!d) {
        var e = m(a);
        e = v(e);
        if ((e = this.getResolvedLink(e)) && e.getNode().isDirectory()) throw h("EISDIR", "open", e.getPath());
        a = this.openSync(a, b);
      }

      try {
        var r = $b(this.getFileByFdOrThrow(a).getBuffer(), c);
      } finally {
        d || this.closeSync(a);
      }

      return r;
    };

    a.prototype.readFileSync = function (a, b) {
      b = zd(b);
      var c = k(b.flag);
      return this.readFileBase(a, c, b.encoding);
    };

    a.prototype.readFile = function (a, b, c) {
      c = B(zd)(b, c);
      b = c[0];
      c = c[1];
      var d = k(b.flag);
      this.wrapAsync(this.readFileBase, [a, d, b.encoding], c);
    };

    a.prototype.writeBase = function (a, b, c, d, e) {
      return this.getFileByFdOrThrow(a, "write").write(b, c, d, e);
    };

    a.prototype.writeSync = function (a, b, c, d, e) {
      Ya(a);
      var r = "string" !== typeof b;

      if (r) {
        var D = (c || 0) | 0;
        var f = d;
        c = e;
      } else var Xa = d;

      b = La(b, Xa);
      r ? "undefined" === typeof f && (f = b.length) : (D = 0, f = b.length);
      return this.writeBase(a, b, D, f, c);
    };

    a.prototype.write = function (a, b, c, d, e, f) {
      var r = this;
      Ya(a);
      var D = typeof b,
          Xa = typeof c,
          g = typeof d,
          h = typeof e;
      if ("string" !== D) {
        if ("function" === Xa) var k = c;else if ("function" === g) {
          var lb = c | 0;
          k = d;
        } else if ("function" === h) {
          lb = c | 0;
          var m = d;
          k = e;
        } else {
          lb = c | 0;
          m = d;
          var n = e;
          k = f;
        }
      } else if ("function" === Xa) k = c;else if ("function" === g) n = c, k = d;else if ("function" === h) {
        n = c;
        var va = d;
        k = e;
      }
      var p = La(b, va);
      "string" !== D ? "undefined" === typeof m && (m = p.length) : (lb = 0, m = p.length);
      var v = q(k);
      $c.default(function () {
        try {
          var c = r.writeBase(a, p, lb, m, n);
          "string" !== D ? v(null, c, p) : v(null, c, b);
        } catch (qf) {
          v(qf);
        }
      });
    };

    a.prototype.writeFileBase = function (a, b, c, d) {
      var e = "number" === typeof a;
      a = e ? a : this.openBase(m(a), c, d);
      d = 0;
      var r = b.length;
      c = c & $a ? void 0 : 0;

      try {
        for (; 0 < r;) {
          var D = this.writeSync(a, b, d, r, c);
          d += D;
          r -= D;
          void 0 !== c && (c += D);
        }
      } finally {
        e || this.closeSync(a);
      }
    };

    a.prototype.writeFileSync = function (a, b, c) {
      var d = Bd(c);
      c = k(d.flag);
      var e = M(d.mode);
      b = La(b, d.encoding);
      this.writeFileBase(a, b, c, e);
    };

    a.prototype.writeFile = function (a, b, c, d) {
      var e = c;
      "function" === typeof c && (e = Ad, d = c);
      c = q(d);
      var r = Bd(e);
      e = k(r.flag);
      d = M(r.mode);
      b = La(b, r.encoding);
      this.wrapAsync(this.writeFileBase, [a, b, e, d], c);
    };

    a.prototype.linkBase = function (a, b) {
      var c = v(a),
          d = this.getLink(c);
      if (!d) throw h("ENOENT", "link", a, b);
      var e = v(b);
      c = this.getLinkParent(e);
      if (!c) throw h("ENOENT", "link", a, b);
      e = e[e.length - 1];
      if (c.getChild(e)) throw h("EEXIST", "link", a, b);
      a = d.getNode();
      a.nlink++;
      c.createChild(e, a);
    };

    a.prototype.copyFileBase = function (a, b, c) {
      var d = this.readFileSync(a);
      if (c & hf && this.existsSync(b)) throw h("EEXIST", "copyFile", a, b);
      if (c & jf) throw h("ENOSYS", "copyFile", a, b);
      this.writeFileBase(b, d, ua.w, 438);
    };

    a.prototype.copyFileSync = function (a, b, c) {
      a = m(a);
      b = m(b);
      return this.copyFileBase(a, b, (c || 0) | 0);
    };

    a.prototype.copyFile = function (a, b, c, d) {
      a = m(a);
      b = m(b);
      if ("function" === typeof c) var e = 0;else e = c, c = d;
      q(c);
      this.wrapAsync(this.copyFileBase, [a, b, e], c);
    };

    a.prototype.linkSync = function (a, b) {
      a = m(a);
      b = m(b);
      this.linkBase(a, b);
    };

    a.prototype.link = function (a, b, c) {
      a = m(a);
      b = m(b);
      this.wrapAsync(this.linkBase, [a, b], c);
    };

    a.prototype.unlinkBase = function (a) {
      var b = v(a);
      b = this.getLink(b);
      if (!b) throw h("ENOENT", "unlink", a);
      if (b.length) throw Error("Dir not empty...");
      this.deleteLink(b);
      a = b.getNode();
      a.nlink--;
      0 >= a.nlink && this.deleteNode(a);
    };

    a.prototype.unlinkSync = function (a) {
      a = m(a);
      this.unlinkBase(a);
    };

    a.prototype.unlink = function (a, b) {
      a = m(a);
      this.wrapAsync(this.unlinkBase, [a], b);
    };

    a.prototype.symlinkBase = function (a, b) {
      var c = v(b),
          d = this.getLinkParent(c);
      if (!d) throw h("ENOENT", "symlink", a, b);
      c = c[c.length - 1];
      if (d.getChild(c)) throw h("EEXIST", "symlink", a, b);
      b = d.createChild(c);
      b.getNode().makeSymlink(v(a));
      return b;
    };

    a.prototype.symlinkSync = function (a, b) {
      a = m(a);
      b = m(b);
      this.symlinkBase(a, b);
    };

    a.prototype.symlink = function (a, b, c, d) {
      c = q("function" === typeof c ? c : d);
      a = m(a);
      b = m(b);
      this.wrapAsync(this.symlinkBase, [a, b], c);
    };

    a.prototype.realpathBase = function (a, b) {
      var c = v(a);
      c = this.getResolvedLink(c);
      if (!c) throw h("ENOENT", "realpath", a);
      return K.strToEncoding(c.getPath(), b);
    };

    a.prototype.realpathSync = function (a, b) {
      return this.realpathBase(m(a), Ed(b).encoding);
    };

    a.prototype.realpath = function (a, b, c) {
      c = lf(b, c);
      b = c[0];
      c = c[1];
      a = m(a);
      this.wrapAsync(this.realpathBase, [a, b.encoding], c);
    };

    a.prototype.lstatBase = function (a, b) {
      void 0 === b && (b = !1);
      var c = this.getLink(v(a));
      if (!c) throw h("ENOENT", "lstat", a);
      return ka.default.build(c.getNode(), b);
    };

    a.prototype.lstatSync = function (a, b) {
      return this.lstatBase(m(a), e(b).bigint);
    };

    a.prototype.lstat = function (a, b, c) {
      c = d(b, c);
      b = c[0];
      c = c[1];
      this.wrapAsync(this.lstatBase, [m(a), b.bigint], c);
    };

    a.prototype.statBase = function (a, b) {
      void 0 === b && (b = !1);
      var c = this.getResolvedLink(v(a));
      if (!c) throw h("ENOENT", "stat", a);
      return ka.default.build(c.getNode(), b);
    };

    a.prototype.statSync = function (a, b) {
      return this.statBase(m(a), e(b).bigint);
    };

    a.prototype.stat = function (a, b, c) {
      c = d(b, c);
      b = c[0];
      c = c[1];
      this.wrapAsync(this.statBase, [m(a), b.bigint], c);
    };

    a.prototype.fstatBase = function (a, b) {
      void 0 === b && (b = !1);
      a = this.getFileByFd(a);
      if (!a) throw h("EBADF", "fstat");
      return ka.default.build(a.node, b);
    };

    a.prototype.fstatSync = function (a, b) {
      return this.fstatBase(a, e(b).bigint);
    };

    a.prototype.fstat = function (a, b, c) {
      b = d(b, c);
      this.wrapAsync(this.fstatBase, [a, b[0].bigint], b[1]);
    };

    a.prototype.renameBase = function (a, b) {
      var c = this.getLink(v(a));
      if (!c) throw h("ENOENT", "rename", a, b);
      var d = v(b),
          e = this.getLinkParent(d);
      if (!e) throw h("ENOENT", "rename", a, b);
      (a = c.parent) && a.deleteChild(c);
      c.steps = Xb(e.steps, [d[d.length - 1]]);
      e.setChild(c.getName(), c);
    };

    a.prototype.renameSync = function (a, b) {
      a = m(a);
      b = m(b);
      this.renameBase(a, b);
    };

    a.prototype.rename = function (a, b, c) {
      a = m(a);
      b = m(b);
      this.wrapAsync(this.renameBase, [a, b], c);
    };

    a.prototype.existsBase = function (a) {
      return !!this.statBase(a);
    };

    a.prototype.existsSync = function (a) {
      try {
        return this.existsBase(m(a));
      } catch (D) {
        return !1;
      }
    };

    a.prototype.exists = function (a, b) {
      var c = this,
          d = m(a);
      if ("function" !== typeof b) throw Error(fa.CB);
      $c.default(function () {
        try {
          b(c.existsBase(d));
        } catch (va) {
          b(!1);
        }
      });
    };

    a.prototype.accessBase = function (a) {
      this.getLinkOrThrow(a, "access");
    };

    a.prototype.accessSync = function (a, b) {
      void 0 === b && (b = wd);
      a = m(a);
      this.accessBase(a, b | 0);
    };

    a.prototype.access = function (a, b, c) {
      var d = wd;
      "function" !== typeof b && (d = b | 0, b = q(c));
      a = m(a);
      this.wrapAsync(this.accessBase, [a, d], b);
    };

    a.prototype.appendFileSync = function (a, b, c) {
      void 0 === c && (c = Cd);
      c = Dd(c);
      c.flag && a >>> 0 !== a || (c.flag = "a");
      this.writeFileSync(a, b, c);
    };

    a.prototype.appendFile = function (a, b, c, d) {
      d = kf(c, d);
      c = d[0];
      d = d[1];
      c.flag && a >>> 0 !== a || (c.flag = "a");
      this.writeFile(a, b, c, d);
    };

    a.prototype.readdirBase = function (a, b) {
      var c = v(a);
      c = this.getResolvedLink(c);
      if (!c) throw h("ENOENT", "readdir", a);
      if (!c.getNode().isDirectory()) throw h("ENOTDIR", "scandir", a);

      if (b.withFileTypes) {
        var d = [];

        for (e in c.children) (a = c.getChild(e)) && d.push(Qc.default.build(a, b.encoding));

        Yb || "buffer" === b.encoding || d.sort(function (a, b) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
        return d;
      }

      var e = [];

      for (d in c.children) e.push(K.strToEncoding(d, b.encoding));

      Yb || "buffer" === b.encoding || e.sort();
      return e;
    };

    a.prototype.readdirSync = function (a, b) {
      b = Gd(b);
      a = m(a);
      return this.readdirBase(a, b);
    };

    a.prototype.readdir = function (a, b, c) {
      c = mf(b, c);
      b = c[0];
      c = c[1];
      a = m(a);
      this.wrapAsync(this.readdirBase, [a, b], c);
    };

    a.prototype.readlinkBase = function (a, b) {
      var c = this.getLinkOrThrow(a, "readlink").getNode();
      if (!c.isSymlink()) throw h("EINVAL", "readlink", a);
      a = S + c.symlink.join(S);
      return K.strToEncoding(a, b);
    };

    a.prototype.readlinkSync = function (a, b) {
      b = ob(b);
      a = m(a);
      return this.readlinkBase(a, b.encoding);
    };

    a.prototype.readlink = function (a, b, c) {
      c = yd(b, c);
      b = c[0];
      c = c[1];
      a = m(a);
      this.wrapAsync(this.readlinkBase, [a, b.encoding], c);
    };

    a.prototype.fsyncBase = function (a) {
      this.getFileByFdOrThrow(a, "fsync");
    };

    a.prototype.fsyncSync = function (a) {
      this.fsyncBase(a);
    };

    a.prototype.fsync = function (a, b) {
      this.wrapAsync(this.fsyncBase, [a], b);
    };

    a.prototype.fdatasyncBase = function (a) {
      this.getFileByFdOrThrow(a, "fdatasync");
    };

    a.prototype.fdatasyncSync = function (a) {
      this.fdatasyncBase(a);
    };

    a.prototype.fdatasync = function (a, b) {
      this.wrapAsync(this.fdatasyncBase, [a], b);
    };

    a.prototype.ftruncateBase = function (a, b) {
      this.getFileByFdOrThrow(a, "ftruncate").truncate(b);
    };

    a.prototype.ftruncateSync = function (a, b) {
      this.ftruncateBase(a, b);
    };

    a.prototype.ftruncate = function (a, b, c) {
      var d = "number" === typeof b ? b : 0;
      b = q("number" === typeof b ? c : b);
      this.wrapAsync(this.ftruncateBase, [a, d], b);
    };

    a.prototype.truncateBase = function (a, b) {
      a = this.openSync(a, "r+");

      try {
        this.ftruncateSync(a, b);
      } finally {
        this.closeSync(a);
      }
    };

    a.prototype.truncateSync = function (a, b) {
      if (a >>> 0 === a) return this.ftruncateSync(a, b);
      this.truncateBase(a, b);
    };

    a.prototype.truncate = function (a, b, c) {
      var d = "number" === typeof b ? b : 0;
      b = q("number" === typeof b ? c : b);
      if (a >>> 0 === a) return this.ftruncate(a, d, b);
      this.wrapAsync(this.truncateBase, [a, d], b);
    };

    a.prototype.futimesBase = function (a, b, c) {
      a = this.getFileByFdOrThrow(a, "futimes").node;
      a.atime = new Date(1E3 * b);
      a.mtime = new Date(1E3 * c);
    };

    a.prototype.futimesSync = function (a, b, c) {
      this.futimesBase(a, ha(b), ha(c));
    };

    a.prototype.futimes = function (a, b, c, d) {
      this.wrapAsync(this.futimesBase, [a, ha(b), ha(c)], d);
    };

    a.prototype.utimesBase = function (a, b, c) {
      a = this.openSync(a, "r+");

      try {
        this.futimesBase(a, b, c);
      } finally {
        this.closeSync(a);
      }
    };

    a.prototype.utimesSync = function (a, b, c) {
      this.utimesBase(m(a), ha(b), ha(c));
    };

    a.prototype.utimes = function (a, b, c, d) {
      this.wrapAsync(this.utimesBase, [m(a), ha(b), ha(c)], d);
    };

    a.prototype.mkdirBase = function (a, b) {
      var c = v(a);
      if (!c.length) throw h("EISDIR", "mkdir", a);
      var d = this.getLinkParentAsDirOrThrow(a, "mkdir");
      c = c[c.length - 1];
      if (d.getChild(c)) throw h("EEXIST", "mkdir", a);
      d.createChild(c, this.createNode(!0, b));
    };

    a.prototype.mkdirpBase = function (a, b) {
      a = v(a);

      for (var c = this.root, d = 0; d < a.length; d++) {
        var e = a[d];
        if (!c.getNode().isDirectory()) throw h("ENOTDIR", "mkdir", c.getPath());
        var f = c.getChild(e);
        if (f) {
          if (f.getNode().isDirectory()) c = f;else throw h("ENOTDIR", "mkdir", f.getPath());
        } else c = c.createChild(e, this.createNode(!0, b));
      }
    };

    a.prototype.mkdirSync = function (a, b) {
      b = f(b);
      var c = M(b.mode, 511);
      a = m(a);
      b.recursive ? this.mkdirpBase(a, c) : this.mkdirBase(a, c);
    };

    a.prototype.mkdir = function (a, b, c) {
      var d = f(b);
      b = q("function" === typeof b ? b : c);
      c = M(d.mode, 511);
      a = m(a);
      d.recursive ? this.wrapAsync(this.mkdirpBase, [a, c], b) : this.wrapAsync(this.mkdirBase, [a, c], b);
    };

    a.prototype.mkdirpSync = function (a, b) {
      this.mkdirSync(a, {
        mode: b,
        recursive: !0
      });
    };

    a.prototype.mkdirp = function (a, b, c) {
      var d = "function" === typeof b ? void 0 : b;
      b = q("function" === typeof b ? b : c);
      this.mkdir(a, {
        mode: d,
        recursive: !0
      }, b);
    };

    a.prototype.mkdtempBase = function (a, b, c) {
      void 0 === c && (c = 5);
      var d = a + this.genRndStr();

      try {
        return this.mkdirBase(d, 511), K.strToEncoding(d, b);
      } catch (va) {
        if ("EEXIST" === va.code) {
          if (1 < c) return this.mkdtempBase(a, b, c - 1);
          throw Error("Could not create temp dir.");
        }

        throw va;
      }
    };

    a.prototype.mkdtempSync = function (a, b) {
      b = ob(b).encoding;
      if (!a || "string" !== typeof a) throw new TypeError("filename prefix is required");
      qb(a);
      return this.mkdtempBase(a, b);
    };

    a.prototype.mkdtemp = function (a, b, c) {
      c = yd(b, c);
      b = c[0].encoding;
      c = c[1];
      if (!a || "string" !== typeof a) throw new TypeError("filename prefix is required");
      qb(a) && this.wrapAsync(this.mkdtempBase, [a, b], c);
    };

    a.prototype.rmdirBase = function (a, b) {
      b = aa({}, Fd, b);
      var c = this.getLinkAsDirOrThrow(a, "rmdir");
      if (c.length && !b.recursive) throw h("ENOTEMPTY", "rmdir", a);
      this.deleteLink(c);
    };

    a.prototype.rmdirSync = function (a, b) {
      this.rmdirBase(m(a), b);
    };

    a.prototype.rmdir = function (a, b, c) {
      var d = aa({}, Fd, b);
      b = q("function" === typeof b ? b : c);
      this.wrapAsync(this.rmdirBase, [m(a), d], b);
    };

    a.prototype.fchmodBase = function (a, b) {
      this.getFileByFdOrThrow(a, "fchmod").chmod(b);
    };

    a.prototype.fchmodSync = function (a, b) {
      this.fchmodBase(a, M(b));
    };

    a.prototype.fchmod = function (a, b, c) {
      this.wrapAsync(this.fchmodBase, [a, M(b)], c);
    };

    a.prototype.chmodBase = function (a, b) {
      a = this.openSync(a, "r+");

      try {
        this.fchmodBase(a, b);
      } finally {
        this.closeSync(a);
      }
    };

    a.prototype.chmodSync = function (a, b) {
      b = M(b);
      a = m(a);
      this.chmodBase(a, b);
    };

    a.prototype.chmod = function (a, b, c) {
      b = M(b);
      a = m(a);
      this.wrapAsync(this.chmodBase, [a, b], c);
    };

    a.prototype.lchmodBase = function (a, b) {
      a = this.openBase(a, na, 0, !1);

      try {
        this.fchmodBase(a, b);
      } finally {
        this.closeSync(a);
      }
    };

    a.prototype.lchmodSync = function (a, b) {
      b = M(b);
      a = m(a);
      this.lchmodBase(a, b);
    };

    a.prototype.lchmod = function (a, b, c) {
      b = M(b);
      a = m(a);
      this.wrapAsync(this.lchmodBase, [a, b], c);
    };

    a.prototype.fchownBase = function (a, b, c) {
      this.getFileByFdOrThrow(a, "fchown").chown(b, c);
    };

    a.prototype.fchownSync = function (a, b, c) {
      Ha(b);
      Ia(c);
      this.fchownBase(a, b, c);
    };

    a.prototype.fchown = function (a, b, c, d) {
      Ha(b);
      Ia(c);
      this.wrapAsync(this.fchownBase, [a, b, c], d);
    };

    a.prototype.chownBase = function (a, b, c) {
      this.getResolvedLinkOrThrow(a, "chown").getNode().chown(b, c);
    };

    a.prototype.chownSync = function (a, b, c) {
      Ha(b);
      Ia(c);
      this.chownBase(m(a), b, c);
    };

    a.prototype.chown = function (a, b, c, d) {
      Ha(b);
      Ia(c);
      this.wrapAsync(this.chownBase, [m(a), b, c], d);
    };

    a.prototype.lchownBase = function (a, b, c) {
      this.getLinkOrThrow(a, "lchown").getNode().chown(b, c);
    };

    a.prototype.lchownSync = function (a, b, c) {
      Ha(b);
      Ia(c);
      this.lchownBase(m(a), b, c);
    };

    a.prototype.lchown = function (a, b, c, d) {
      Ha(b);
      Ia(c);
      this.wrapAsync(this.lchownBase, [m(a), b, c], d);
    };

    a.prototype.watchFile = function (a, b, c) {
      a = m(a);
      var d = b;
      "function" === typeof d && (c = b, d = null);
      if ("function" !== typeof c) throw Error('"watchFile()" requires a listener function');
      b = 5007;
      var e = !0;
      d && "object" === typeof d && ("number" === typeof d.interval && (b = d.interval), "boolean" === typeof d.persistent && (e = d.persistent));
      d = this.statWatchers[a];
      d || (d = new this.StatWatcher(), d.start(a, e, b), this.statWatchers[a] = d);
      d.addListener("change", c);
      return d;
    };

    a.prototype.unwatchFile = function (a, b) {
      a = m(a);
      var c = this.statWatchers[a];
      c && ("function" === typeof b ? c.removeListener("change", b) : c.removeAllListeners("change"), 0 === c.listenerCount("change") && (c.stop(), delete this.statWatchers[a]));
    };

    a.prototype.createReadStream = function (a, b) {
      return new this.ReadStream(a, b);
    };

    a.prototype.createWriteStream = function (a, b) {
      return new this.WriteStream(a, b);
    };

    a.prototype.watch = function (a, b, c) {
      a = m(a);
      var d = b;
      "function" === typeof b && (c = b, d = null);
      var e = ob(d);
      b = e.persistent;
      d = e.recursive;
      e = e.encoding;
      void 0 === b && (b = !0);
      void 0 === d && (d = !1);
      var f = new this.FSWatcher();
      f.start(a, b, d, e);
      c && f.addListener("change", c);
      return f;
    };

    a.fd = 2147483647;
    return a;
  }();

  b.Volume = a;

  var Hd = function (a) {
    function b(b) {
      var c = a.call(this) || this;

      c.onInterval = function () {
        try {
          var a = c.vol.statSync(c.filename);
          c.hasChanged(a) && (c.emit("change", a, c.prev), c.prev = a);
        } finally {
          c.loop();
        }
      };

      c.vol = b;
      return c;
    }

    Ja(b, a);

    b.prototype.loop = function () {
      this.timeoutRef = this.setTimeout(this.onInterval, this.interval);
    };

    b.prototype.hasChanged = function (a) {
      return a.mtimeMs > this.prev.mtimeMs || a.nlink !== this.prev.nlink ? !0 : !1;
    };

    b.prototype.start = function (a, b, c) {
      void 0 === b && (b = !0);
      void 0 === c && (c = 5007);
      this.filename = m(a);
      this.setTimeout = b ? setTimeout : hd.default;
      this.interval = c;
      this.prev = this.vol.statSync(this.filename);
      this.loop();
    };

    b.prototype.stop = function () {
      clearTimeout(this.timeoutRef);
      L.default.nextTick(ef, this);
    };

    return b;
  }(O.EventEmitter);

  b.StatWatcher = Hd;
  var N;
  lc.inherits(T, Y.Readable);
  b.ReadStream = T;

  T.prototype.open = function () {
    var a = this;

    this._vol.open(this.path, this.flags, this.mode, function (b, c) {
      b ? (a.autoClose && a.destroy && a.destroy(), a.emit("error", b)) : (a.fd = c, a.emit("open", c), a.read());
    });
  };

  T.prototype._read = function (a) {
    if ("number" !== typeof this.fd) return this.once("open", function () {
      this._read(a);
    });

    if (!this.destroyed) {
      if (!N || 128 > N.length - N.used) N = F.bufferAllocUnsafe(this._readableState.highWaterMark), N.used = 0;
      var b = N,
          c = Math.min(N.length - N.used, a),
          d = N.used;
      void 0 !== this.pos && (c = Math.min(this.end - this.pos + 1, c));
      if (0 >= c) return this.push(null);
      var e = this;

      this._vol.read(this.fd, N, N.used, c, this.pos, function (a, c) {
        a ? (e.autoClose && e.destroy && e.destroy(), e.emit("error", a)) : (a = null, 0 < c && (e.bytesRead += c, a = b.slice(d, d + c)), e.push(a));
      });

      void 0 !== this.pos && (this.pos += c);
      N.used += c;
    }
  };

  T.prototype._destroy = function (a, b) {
    this.close(function (c) {
      b(a || c);
    });
  };

  T.prototype.close = function (a) {
    var b = this;
    if (a) this.once("close", a);

    if (this.closed || "number" !== typeof this.fd) {
      if ("number" !== typeof this.fd) {
        this.once("open", ff);
        return;
      }

      return L.default.nextTick(function () {
        return b.emit("close");
      });
    }

    this.closed = !0;

    this._vol.close(this.fd, function (a) {
      a ? b.emit("error", a) : b.emit("close");
    });

    this.fd = null;
  };

  lc.inherits(R, Y.Writable);
  b.WriteStream = R;

  R.prototype.open = function () {
    this._vol.open(this.path, this.flags, this.mode, function (a, b) {
      a ? (this.autoClose && this.destroy && this.destroy(), this.emit("error", a)) : (this.fd = b, this.emit("open", b));
    }.bind(this));
  };

  R.prototype._write = function (a, b, c) {
    if (!(a instanceof F.Buffer)) return this.emit("error", Error("Invalid data"));
    if ("number" !== typeof this.fd) return this.once("open", function () {
      this._write(a, b, c);
    });
    var d = this;

    this._vol.write(this.fd, a, 0, a.length, this.pos, function (a, b) {
      if (a) return d.autoClose && d.destroy && d.destroy(), c(a);
      d.bytesWritten += b;
      c();
    });

    void 0 !== this.pos && (this.pos += a.length);
  };

  R.prototype._writev = function (a, b) {
    if ("number" !== typeof this.fd) return this.once("open", function () {
      this._writev(a, b);
    });

    for (var c = this, d = a.length, e = Array(d), f = 0, g = 0; g < d; g++) {
      var h = a[g].chunk;
      e[g] = h;
      f += h.length;
    }

    d = F.Buffer.concat(e);

    this._vol.write(this.fd, d, 0, d.length, this.pos, function (a, d) {
      if (a) return c.destroy && c.destroy(), b(a);
      c.bytesWritten += d;
      b();
    });

    void 0 !== this.pos && (this.pos += f);
  };

  R.prototype._destroy = T.prototype._destroy;
  R.prototype.close = T.prototype.close;
  R.prototype.destroySoon = R.prototype.end;

  var Id = function (a) {
    function b(b) {
      var c = a.call(this) || this;
      c._filename = "";
      c._filenameEncoded = "";
      c._recursive = !1;
      c._encoding = K.ENCODING_UTF8;

      c._onNodeChange = function () {
        c._emit("change");
      };

      c._onParentChild = function (a) {
        a.getName() === c._getName() && c._emit("rename");
      };

      c._emit = function (a) {
        c.emit("change", a, c._filenameEncoded);
      };

      c._persist = function () {
        c._timer = setTimeout(c._persist, 1E6);
      };

      c._vol = b;
      return c;
    }

    Ja(b, a);

    b.prototype._getName = function () {
      return this._steps[this._steps.length - 1];
    };

    b.prototype.start = function (a, b, c, d) {
      void 0 === b && (b = !0);
      void 0 === c && (c = !1);
      void 0 === d && (d = K.ENCODING_UTF8);
      this._filename = m(a);
      this._steps = v(this._filename);
      this._filenameEncoded = K.strToEncoding(this._filename);
      this._recursive = c;
      this._encoding = d;

      try {
        this._link = this._vol.getLinkOrThrow(this._filename, "FSWatcher");
      } catch (Wb) {
        throw b = Error("watch " + this._filename + " " + Wb.code), b.code = Wb.code, b.errno = Wb.code, b;
      }

      this._link.getNode().on("change", this._onNodeChange);

      this._link.on("child:add", this._onNodeChange);

      this._link.on("child:delete", this._onNodeChange);

      if (a = this._link.parent) a.setMaxListeners(a.getMaxListeners() + 1), a.on("child:delete", this._onParentChild);
      b && this._persist();
    };

    b.prototype.close = function () {
      clearTimeout(this._timer);

      this._link.getNode().removeListener("change", this._onNodeChange);

      var a = this._link.parent;
      a && a.removeListener("child:delete", this._onParentChild);
    };

    return b;
  }(O.EventEmitter);

  b.FSWatcher = Id;
});
t(Xe);
var Ye = Xe.pathToFilename,
    Ze = Xe.filenameToSteps,
    $e = Xe.Volume,
    af = u(function (a, b) {
  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  b.fsProps = "constants F_OK R_OK W_OK X_OK Stats".split(" ");
  b.fsSyncMethods = "renameSync ftruncateSync truncateSync chownSync fchownSync lchownSync chmodSync fchmodSync lchmodSync statSync lstatSync fstatSync linkSync symlinkSync readlinkSync realpathSync unlinkSync rmdirSync mkdirSync mkdirpSync readdirSync closeSync openSync utimesSync futimesSync fsyncSync writeSync readSync readFileSync writeFileSync appendFileSync existsSync accessSync fdatasyncSync mkdtempSync copyFileSync createReadStream createWriteStream".split(" ");
  b.fsAsyncMethods = "rename ftruncate truncate chown fchown lchown chmod fchmod lchmod stat lstat fstat link symlink readlink realpath unlink rmdir mkdir mkdirp readdir close open utimes futimes fsync write read readFile writeFile appendFile exists access fdatasync mkdtemp copyFile watchFile unwatchFile watch".split(" ");
});
t(af);
var bf = u(function (a, b) {
  function c(a) {
    for (var b = {
      F_OK: g,
      R_OK: h,
      W_OK: k,
      X_OK: p,
      constants: w.constants,
      Stats: ka.default,
      Dirent: Qc.default
    }, c = 0, d = e; c < d.length; c++) {
      var n = d[c];
      "function" === typeof a[n] && (b[n] = a[n].bind(a));
    }

    c = 0;

    for (d = f; c < d.length; c++) n = d[c], "function" === typeof a[n] && (b[n] = a[n].bind(a));

    b.StatWatcher = a.StatWatcher;
    b.FSWatcher = a.FSWatcher;
    b.WriteStream = a.WriteStream;
    b.ReadStream = a.ReadStream;
    b.promises = a.promises;
    b._toUnixTimestamp = Xe.toUnixTimestamp;
    return b;
  }

  var d = l && l.__assign || function () {
    d = Object.assign || function (a) {
      for (var b, c = 1, d = arguments.length; c < d; c++) {
        b = arguments[c];

        for (var e in b) Object.prototype.hasOwnProperty.call(b, e) && (a[e] = b[e]);
      }

      return a;
    };

    return d.apply(this, arguments);
  };

  Object.defineProperty(b, "__esModule", {
    value: !0
  });
  var e = af.fsSyncMethods,
      f = af.fsAsyncMethods,
      g = w.constants.F_OK,
      h = w.constants.R_OK,
      k = w.constants.W_OK,
      p = w.constants.X_OK;
  b.Volume = Xe.Volume;
  b.vol = new Xe.Volume();
  b.createFsFromVolume = c;
  b.fs = c(b.vol);
  a.exports = d(d({}, a.exports), b.fs);
  a.exports.semantic = !0;
});
t(bf);
var rf = bf.createFsFromVolume;

gd.prototype.emit = function (a) {
  for (var b, c, d = [], e = 1; e < arguments.length; e++) d[e - 1] = arguments[e];

  e = this.listeners(a);

  try {
    for (var f = da(e), g = f.next(); !g.done; g = f.next()) {
      var h = g.value;

      try {
        h.apply(void 0, ia(d));
      } catch (k) {
        console.error(k);
      }
    }
  } catch (k) {
    b = {
      error: k
    };
  } finally {
    try {
      g && !g.done && (c = f.return) && c.call(f);
    } finally {
      if (b) throw b.error;
    }
  }

  return 0 < e.length;
};

var sf = function () {
  function a() {
    this.volume = new $e();
    this.fs = rf(this.volume);
    this.fromJSON({
      "/dev/stdin": "",
      "/dev/stdout": "",
      "/dev/stderr": ""
    });
  }

  a.prototype._toJSON = function (a, c, d) {
    void 0 === c && (c = {});
    var b = !0,
        f;

    for (f in a.children) {
      b = !1;
      var g = a.getChild(f);

      if (g) {
        var h = g.getNode();
        h && h.isFile() ? (g = g.getPath(), d && (g = Yc(d, g)), c[g] = h.getBuffer()) : h && h.isDirectory() && this._toJSON(g, c, d);
      }
    }

    a = a.getPath();
    d && (a = Yc(d, a));
    a && b && (c[a] = null);
    return c;
  };

  a.prototype.toJSON = function (a, c, d) {
    var b, f;
    void 0 === c && (c = {});
    void 0 === d && (d = !1);
    var g = [];

    if (a) {
      a instanceof Array || (a = [a]);

      try {
        for (var h = da(a), k = h.next(); !k.done; k = h.next()) {
          var p = Ye(k.value),
              n = this.volume.getResolvedLink(p);
          n && g.push(n);
        }
      } catch (xa) {
        var q = {
          error: xa
        };
      } finally {
        try {
          k && !k.done && (b = h.return) && b.call(h);
        } finally {
          if (q) throw q.error;
        }
      }
    } else g.push(this.volume.root);

    if (!g.length) return c;

    try {
      for (var B = da(g), m = B.next(); !m.done; m = B.next()) n = m.value, this._toJSON(n, c, d ? n.getPath() : "");
    } catch (xa) {
      var v = {
        error: xa
      };
    } finally {
      try {
        m && !m.done && (f = B.return) && f.call(B);
      } finally {
        if (v) throw v.error;
      }
    }

    return c;
  };

  a.prototype.fromJSONFixed = function (a, c) {
    for (var b in c) {
      var e = c[b];

      if (e ? null !== Object.getPrototypeOf(e) : null !== e) {
        var f = Ze(b);
        1 < f.length && (f = "/" + f.slice(0, f.length - 1).join("/"), a.mkdirpBase(f, 511));
        a.writeFileSync(b, e || "");
      } else a.mkdirpBase(b, 511);
    }
  };

  a.prototype.fromJSON = function (a) {
    this.volume = new $e();
    this.fromJSONFixed(this.volume, a);
    this.fs = rf(this.volume);
    this.volume.releasedFds = [0, 1, 2];
    a = this.volume.openSync("/dev/stderr", "w");
    var b = this.volume.openSync("/dev/stdout", "w"),
        d = this.volume.openSync("/dev/stdin", "r");
    if (2 !== a) throw Error("invalid handle for stderr: " + a);
    if (1 !== b) throw Error("invalid handle for stdout: " + b);
    if (0 !== d) throw Error("invalid handle for stdin: " + d);
  };

  a.prototype.getStdOut = function () {
    return ba(this, void 0, void 0, function () {
      var a,
          c = this;
      return ca(this, function () {
        a = new Promise(function (a) {
          a(c.fs.readFileSync("/dev/stdout", "utf8"));
        });
        return [2, a];
      });
    });
  };

  return a;
}();

exports.WasmFs = sf;
var _default = sf;
exports.default = _default;
},{}],"kn2F":[function(require,module,exports) {
"use strict";

require("regenerator-runtime/runtime");

var _wasi = require("@wasmer/wasi");

var _browser = _interopRequireDefault(require("@wasmer/wasi/lib/bindings/browser"));

var _wasmTransformer = require("@wasmer/wasm-transformer");

var _wasmfs = require("@wasmer/wasmfs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// specific parcel (missing for async/await)
function convertUint8ArrayToString(uint8array) {
  return new TextDecoder('utf-8').decode(uint8array);
} // based on https://github.com/wasmerio/wasmer-js/tree/master/packages/wasi#quick-start


// Instantiate a new WASI Instance
var wasmFs = new _wasmfs.WasmFs();
window.wasmFs = wasmFs; // expose wasmFs instance to debug

var wasi = new _wasi.WASI({
  // first arg is the name of the command called
  args: ['./c-app-generated.wasm', new Date().toGMTString(), 'Running with wasmer on the Browser (emulating File System)'],
  env: {},
  bindings: _objectSpread(_objectSpread({}, _browser.default), {}, {
    fs: wasmFs.fs
  }),
  // same as the node example, map a fake FileSystem
  preopens: {
    '.': '.'
  }
});

var startWasiTask = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var response, responseArrayBuffer, wasm_bytes, lowered_wasm, module, instance, stdout;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch('./c-app-generated.wasm');

          case 2:
            response = _context.sent;
            _context.next = 5;
            return response.arrayBuffer();

          case 5:
            responseArrayBuffer = _context.sent;
            // Instantiate the WebAssembly file
            wasm_bytes = new Uint8Array(responseArrayBuffer).buffer;
            _context.next = 9;
            return (0, _wasmTransformer.lowerI64Imports)(wasm_bytes);

          case 9:
            lowered_wasm = _context.sent;
            _context.next = 12;
            return WebAssembly.compile(lowered_wasm);

          case 12:
            module = _context.sent;
            _context.next = 15;
            return WebAssembly.instantiate(module, _objectSpread({}, wasi.getImports(module)));

          case 15:
            instance = _context.sent;
            // Start the WebAssembly WASI instance!
            wasi.start(instance); // Output what's inside of /dev/stdout!

            _context.next = 19;
            return wasmFs.getStdOut();

          case 19:
            stdout = _context.sent;
            console.log(stdout);

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function startWasiTask() {
    return _ref.apply(this, arguments);
  };
}();

startWasiTask().then(function () {
  var output = convertUint8ArrayToString(wasmFs.fs.readFileSync('tmp.txt'));
  document.querySelector('.output').textContent = output;
  console.log('Generated tmp.txt file on the location ./ 👇');
  console.log(output);
}).catch(function (e) {
  console.error('failure', e);
  var error = "\nOOPS, there was an error, your device might not support WebAssembly\nor something went wrong in the execution of the wasm file.\n\nThis demo works well on Chrome and Firefox, it does not work yet on Safari.\n\n---\n\n".concat(e.message, "\n\n").concat(e.stack, "\n    ");
  document.querySelector('.output').textContent = error;
});
},{"regenerator-runtime/runtime":"QVnC","@wasmer/wasi":"Klds","@wasmer/wasi/lib/bindings/browser":"yTJC","@wasmer/wasm-transformer":"Y7ZV","@wasmer/wasmfs":"gRtQ"}]},{},["kn2F"], null)
//# sourceMappingURL=c-app.1b17c41a.js.map