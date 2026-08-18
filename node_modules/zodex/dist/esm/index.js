// dezerialize.ts
import { z } from "zod";

// types.ts
var NUMBER_FORMATS = /* @__PURE__ */ new Set([
  "int32",
  "uint32",
  "float32",
  "float64",
  "safeint"
]);
var STRING_KINDS = /* @__PURE__ */ new Set([
  "url",
  "emoji",
  "nanoid",
  "cuid",
  "cuid2",
  "ulid",
  "date",
  "duration",
  "base64",
  "base64url",
  "guid",
  "xid",
  "ksuid",
  "json_string",
  "e164",
  "jwt",
  "ipv4",
  "ipv6",
  "cidrv4",
  "cidrv6",
  "e164"
  // "uuidv8", // In docs only
  // "ascii", // In docs only
  // "utf8", // In docs only
  // "lowercase", // Doesn't appear to have enough data to serialize
  // "uppercase", // Doesn't appear to have enough data to serialize
]);

// dezerialize.ts
function checkRef(item, opts) {
  if ("$ref" in item) {
    const lazy = z.lazy(() => z.string());
    opts.$refs.push([lazy, item.$ref]);
    return lazy;
  }
  return false;
}
var getCustomChecks = (base, shape, opts) => {
  if ("checks" in shape && opts.checks) {
    for (const check of shape.checks) {
      base = base.check(opts.checks[check.name]);
    }
  }
  return base;
};
var getError = (shape, opts) => {
  return typeof shape.error == "string" ? shape.error : shape.error && opts.errors ? { error: opts.errors[shape.error.key] } : void 0;
};
var d = dezerializeRefs;
var dezerializers = {
  number: (shape, opts) => {
    const method = shape.format && NUMBER_FORMATS.has(shape.format) ? shape.format === "safeint" ? "int" : shape.format : "number";
    let n = shape.coerce ? z.coerce.number(getError(shape, opts)) : z[method](getError(shape, opts));
    if (shape.min !== void 0) {
      n = shape.minInclusive ? n.min(shape.min) : n.gt(shape.min);
    }
    if (shape.max !== void 0) {
      n = shape.maxInclusive ? n.max(shape.max) : n.lt(shape.max);
    }
    if (shape.multipleOf !== void 0) {
      n = n.multipleOf(shape.multipleOf);
    }
    return getCustomChecks(n, shape, opts);
  },
  string: (shape, opts) => {
    let s2 = shape.coerce ? z.coerce.string(getError(shape, opts)) : z.string(getError(shape, opts));
    if (shape.min !== void 0) {
      s2 = s2.min(shape.min);
    }
    if (shape.max !== void 0) {
      s2 = s2.max(shape.max);
    }
    if (shape.length !== void 0) {
      s2 = s2.length(shape.length);
    }
    if (shape.startsWith !== void 0) {
      s2 = s2.startsWith(shape.startsWith);
    }
    if (shape.endsWith !== void 0) {
      s2 = s2.endsWith(shape.endsWith);
    }
    if (shape.toLowerCase !== void 0) {
      s2 = s2.toLowerCase();
    }
    if (shape.toUpperCase !== void 0) {
      s2 = s2.toUpperCase();
    }
    if (shape.trim !== void 0) {
      s2 = s2.trim();
    }
    if ("includes" in shape) {
      s2 = s2.includes(shape.includes, { position: shape.position });
    }
    if ("regex" in shape) {
      s2 = s2.regex(new RegExp(shape.regex, shape.flags));
    }
    if ("kind" in shape) {
      if (shape.kind == "ip") {
        if (shape.version == "v6") {
          s2 = z.ipv6();
        } else {
          s2 = z.ipv4();
        }
      } else if (shape.kind == "cidr") {
        if (shape.version === "v6") {
          s2 = z.cidrv6();
        } else {
          s2 = z.cidrv4();
        }
      } else if (shape.kind == "uuid") {
        s2 = z.uuid({ version: shape.version });
      } else if (shape.kind == "datetime") {
        s2 = z.iso.datetime({
          offset: shape.offset,
          precision: shape.precision,
          local: shape.local
        });
      } else if (shape.kind == "time") {
        s2 = z.iso.time({
          precision: shape.precision
        });
      } else if (shape.kind === "duration" || shape.kind === "date") {
        s2 = z.iso[shape.kind]();
      } else if (shape.kind === "jwt") {
        s2 = "algorithm" in shape ? z.jwt({ alg: shape.algorithm }) : z.jwt();
      } else if (shape.kind == "email") {
        s2 = "pattern" in shape && shape.pattern ? z.email({
          pattern: new RegExp(shape.pattern, shape.flags)
          /* c8 ignore next -- Guard */
        }) : z.email();
      } else if (shape.kind !== "json_string") {
        s2 = z[shape.kind]();
      }
    }
    return getCustomChecks(s2, shape, opts);
  },
  boolean: (shape, opts) => shape.coerce ? z.coerce.boolean(getError(shape, opts)) : z.boolean(getError(shape, opts)),
  nan: (shape, opts) => z.nan(getError(shape, opts)),
  bigInt: (shape, opts) => {
    const method = shape.format && ["uint64", "int64"].includes(shape.format) ? shape.format : "bigint";
    let i = shape.coerce ? z.coerce.bigint(getError(shape, opts)) : z[method](getError(shape, opts));
    if (shape.min !== void 0) {
      const min = BigInt(shape.min);
      i = shape.minInclusive ? i.min(min) : i.gt(min);
    }
    if (shape.max !== void 0) {
      const max = BigInt(shape.max);
      i = shape.maxInclusive ? i.max(max) : i.lt(max);
    }
    if (shape.multipleOf !== void 0) {
      const multipleOf = BigInt(shape.multipleOf);
      i = i.multipleOf(multipleOf);
    }
    return getCustomChecks(i, shape, opts);
  },
  file: (shape, opts) => {
    let i = z.file(getError(shape, opts));
    if (shape.max) {
      i = i.max(shape.max);
    }
    if (shape.min) {
      i = i.min(shape.min);
    }
    if (shape.mime) {
      i = i.mime(shape.mime);
    }
    return i;
  },
  date: (shape, opts) => {
    let i = shape.coerce ? z.coerce.date(getError(shape, opts)) : z.date(getError(shape, opts));
    if (shape.min !== void 0) {
      i = i.min(new Date(shape.min));
    }
    if (shape.max !== void 0) {
      i = i.max(new Date(shape.max));
    }
    return getCustomChecks(i, shape, opts);
  },
  undefined: (shape, opts) => z.undefined(getError(shape, opts)),
  null: (shape, opts) => z.null(getError(shape, opts)),
  any: () => z.any(),
  unknown: () => z.unknown(),
  never: (shape, opts) => z.never(getError(shape, opts)),
  void: (shape, opts) => z.void(getError(shape, opts)),
  literal: (shape, opts) => z.literal(shape.values, getError(shape, opts)),
  templateLiteral: (shape, opts) => {
    const error = getError(shape, opts);
    return z.templateLiteral(
      shape.parts.map((part, idx) => {
        if (typeof part === "string") {
          return part;
        }
        const schema = checkRef(part, opts) || d(part, {
          ...opts,
          path: opts.path + "/parts/" + idx
        });
        return schema;
      }),
      /* c8 ignore next 2 -- TS */
      typeof error === "string" ? error : {
        ...error,
        ...shape.format ? { format: shape.format } : {}
      }
    );
  },
  symbol: (shape, opts) => z.symbol(getError(shape, opts)),
  tuple: (shape, opts) => {
    let i = z.tuple(
      shape.items.map((item, idx) => {
        return checkRef(item, opts) || d(item, {
          ...opts,
          path: opts.path + "/items/" + idx
        });
      }),
      getError(shape, opts)
    );
    if (shape.rest) {
      const rest = checkRef(shape.rest, opts) || d(shape.rest, {
        ...opts,
        path: opts.path + "/rest"
      });
      i = i.rest(rest);
    }
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  set: (shape, opts) => {
    let i = z.set(
      checkRef(shape.value, opts) || d(shape.value, {
        ...opts,
        path: opts.path + "/value"
      }),
      getError(shape, opts)
    );
    if (shape.minSize !== void 0) {
      i = i.min(shape.minSize);
    }
    if (shape.maxSize !== void 0) {
      i = i.max(shape.maxSize);
    }
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  array: (shape, opts) => {
    let i = z.array(
      checkRef(shape.element, opts) || d(shape.element, {
        ...opts,
        path: opts.path + "/element"
      }),
      getError(shape, opts)
    );
    if (shape.minLength !== void 0) {
      i = i.min(shape.minLength);
    }
    if (shape.maxLength !== void 0) {
      i = i.max(shape.maxLength);
    }
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  object: (shape, opts) => {
    let i = z.object(
      Object.fromEntries(
        Object.entries(shape.properties).map(([key, value]) => {
          return [
            key,
            checkRef(value, opts) || d(value, {
              ...opts,
              path: opts.path + "/properties/" + key
            })
          ];
        })
      ),
      getError(shape, opts)
    );
    if (shape.catchall) {
      i = i.catchall(d(shape.catchall, opts));
    }
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  record: (shape, opts) => {
    const i = z.record(
      checkRef(shape.key, opts) || d(shape.key, {
        ...opts,
        path: opts.path + "/key"
      }),
      checkRef(shape.value, opts) || d(shape.value, {
        ...opts,
        path: opts.path + "/value"
      }),
      getError(shape, opts)
    );
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  map: (shape, opts) => {
    const i = z.map(
      checkRef(shape.key, opts) || d(shape.key, {
        ...opts,
        path: opts.path + "/key"
      }),
      checkRef(shape.value, opts) || d(shape.value, {
        ...opts,
        path: opts.path + "/value"
      }),
      getError(shape, opts)
    );
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  enum: (shape, opts) => z.enum(shape.values, getError(shape, opts)),
  union: (shape, opts) => {
    const i = z.union(
      shape.options.map(
        (opt, idx) => checkRef(opt, opts) || d(opt, {
          ...opts,
          path: opts.path + "/options/" + idx
        })
      ),
      getError(shape, opts)
    );
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  discriminatedUnion: (shape, opts) => {
    const i = z.discriminatedUnion(
      shape.discriminator,
      shape.options.map(
        (opt, idx) => checkRef(opt, opts) || d(opt, {
          ...opts,
          path: opts.path + "/options/" + idx
        })
      ),
      getError(shape, opts)
    );
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  intersection: (shape, opts) => {
    const i = z.intersection(
      checkRef(shape.left, opts) || d(shape.left, {
        ...opts,
        path: opts.path + "/left"
      }),
      checkRef(shape.right, opts) || d(shape.right, {
        ...opts,
        path: opts.path + "/right"
      })
    );
    opts.pathToSchema.set(opts.path, i);
    return getCustomChecks(i, shape, opts);
  },
  promise: (shape, opts) => {
    const i = z.promise(
      checkRef(shape.value, opts) || d(shape.value, {
        ...opts,
        path: opts.path + "/value"
      })
    );
    opts.pathToSchema.set(opts.path, i);
    return i;
  },
  catch: (shape, opts) => {
    let base = checkRef(shape.innerType, opts) || d(shape.innerType, {
      ...opts,
      path: opts.path + "/innerType"
    });
    base = base.catch(shape.value);
    opts.pathToSchema.set(opts.path, base);
    return base;
  },
  transform: (shape, opts) => {
    if (!opts.transforms || !(shape.name in opts.transforms)) {
      throw new Error(
        "Must supply transforms for the given transform name, " + shape.name
      );
    }
    return z.transform(opts.transforms[shape.name]);
  },
  pipe: (shape, opts) => {
    const base = checkRef(shape.inner, opts) || d(shape.inner, {
      ...opts,
      path: opts.path + "/inner"
    });
    return getCustomChecks(
      base.pipe(
        d(shape.outer, {
          ...opts,
          path: opts.path + "/outer"
        })
      ),
      shape,
      opts
    );
  }
};
function dezerializeRefs(shape, opts) {
  if ("isOptional" in shape) {
    const { isOptional, ...rest } = shape;
    const inner = d(rest, opts);
    const result = isOptional ? inner.optional() : inner;
    opts.pathToSchema.set(opts.path, result);
    return result;
  }
  if ("isNullable" in shape) {
    const { isNullable, ...rest } = shape;
    const inner = d(rest, opts);
    const result = isNullable ? inner.nullable() : inner;
    opts.pathToSchema.set(opts.path, result);
    return result;
  }
  if ("defaultValue" in shape) {
    const { defaultValue, ...rest } = shape;
    const inner = d(rest, opts);
    const result = inner.default(
      shape.type === "bigInt" ? BigInt(defaultValue) : shape.type === "date" ? new Date(defaultValue) : defaultValue
    );
    opts.pathToSchema.set(opts.path, result);
    return result;
  }
  if ("readonly" in shape) {
    const { readonly, ...rest } = shape;
    const inner = d(rest, opts);
    const result = readonly ? inner.readonly() : inner;
    opts.pathToSchema.set(opts.path, result);
    return result;
  }
  if ("description" in shape && typeof shape.description === "string") {
    const { description, ...rest } = shape;
    const inner = d(rest, opts);
    const result = inner.describe(description);
    opts.pathToSchema.set(opts.path, result);
    return result;
  }
  return dezerializers[shape.type](shape, opts);
}
function resolvePointer(obj, pointer) {
  const tokens = pointer.split("/").slice(1);
  return tokens.reduce((acc, token) => {
    if (acc === void 0) return acc;
    return acc[token.replace(/~1/g, "/").replace(/~0/g, "~")];
  }, obj);
}
function dezerialize(shape, opts = {}) {
  if (!("path" in opts)) {
    opts.path = "#";
  }
  if (!("pathToSchema" in opts)) {
    opts.pathToSchema = /* @__PURE__ */ new Map();
  }
  if (!("$refs" in opts)) {
    opts.$refs = [];
  }
  if (!("originalShape" in opts)) {
    opts.originalShape = shape;
  }
  const options = opts;
  const dez = dezerializeRefs(shape, options);
  for (const [lazy, $ref] of options.$refs) {
    lazy._zod.def.getter = () => {
      const schema = options.pathToSchema.get($ref);
      if (schema) {
        return schema;
      }
      const obj = resolvePointer(options.originalShape, $ref);
      const dez2 = dezerialize(obj, options);
      options.pathToSchema.set($ref, dez2);
      return dez2;
    };
  }
  return dez;
}

// zerialize.ts
import { z as z2 } from "zod";
var PRIMITIVES = {
  ZodString: "string",
  ZodNumber: "number",
  ZodBoolean: "boolean",
  ZodNaN: "nan",
  ZodBigInt: "bigInt",
  ZodDate: "date",
  ZodUndefined: "undefined",
  ZodNull: "null",
  ZodAny: "any",
  ZodUnknown: "unknown",
  ZodNever: "never",
  ZodVoid: "void",
  ZodSymbol: "symbol"
};
var getCustomChecksAndErrors = (def, opts) => {
  let customChecks = null;
  if ("checks" in opts && opts.checks) {
    customChecks = def.checks?.filter((check) => {
      const chk = check._zod.def.check;
      return chk == "custom";
    }).map((check) => {
      const name = Object.entries(
        /* c8 ignore next -- TS doesn't catch */
        opts.checks || {}
      ).find(([, checkFunc]) => {
        return checkFunc === check._zod.check;
      })?.[0];
      if (name) {
        return { name };
      }
      return null;
    }).filter(Boolean);
  }
  let customError;
  if ("error" in def) {
    const key = Object.entries(opts.errors ?? {}).find(([, func]) => {
      return func === def.error;
    })?.[0];
    customError = typeof key == "string" ? { key } : (
      // Not supplying an issue should not be a problem for regular
      //   wrapped string errors
      def.error()
    );
  }
  return Object.assign(
    customChecks ? { checks: customChecks } : {},
    customError ? { error: customError } : {}
  );
};
var s = zerializeRefs;
var zerializers = {
  optional: (def, opts) => ({
    ...s(def.innerType, opts, true),
    isOptional: true
  }),
  nullable: (def, opts) => ({
    ...s(def.innerType, opts, true),
    isNullable: true
  }),
  default: (def, opts) => ({
    ...s(def.innerType, opts, true),
    defaultValue: def.innerType._zod.def.type === "bigint" ? String(def.defaultValue) : def.innerType._zod.def.type === "date" ? def.defaultValue.getTime() : def.defaultValue
  }),
  number: (def, opts) => {
    const checks = def.checks?.reduce((o, check) => {
      const chk = check._zod.def.check;
      const format = check._zod.def.format;
      return {
        ...o,
        ...chk == "greater_than" ? {
          min: check._zod.def.value,
          ...check._zod.def.inclusive ? { minInclusive: true } : {}
        } : chk == "less_than" ? {
          max: check._zod.def.value,
          ...check._zod.def.inclusive ? { maxInclusive: true } : {}
        } : chk == "multiple_of" ? {
          multipleOf: check._zod.def.value
          /* c8 ignore next 2 -- Guard */
        } : {}
      };
    }, {});
    return Object.assign(
      {
        type: "number",
        ...checks,
        ...getCustomChecksAndErrors(def, opts),
        // Check is on `def` itself
        ..."check" in def && def.check === "number_format" && "format" in def ? { format: def.format } : {}
      },
      def.coerce ? { coerce: true } : {}
    );
  },
  template_literal: (def, opts) => {
    const parts = def.parts.map((part, idx) => {
      if (typeof part == "string") {
        return part;
      }
      return s(part, {
        ...opts,
        currentPath: [...opts.currentPath, "parts", String(idx)]
      });
    });
    return {
      type: "templateLiteral",
      parts,
      ...def.format ? { format: def.format } : {}
    };
  },
  string: (def, opts) => {
    const checks = def.checks?.reduce((o, check) => {
      const chk = check._zod.def.check;
      const format2 = check._zod.def.format;
      return {
        ...o,
        ...chk == "min_length" ? { min: check._zod.def.minimum } : chk == "max_length" ? { max: check._zod.def.maximum } : chk == "length_equals" ? {
          length: check._zod.def.length
        } : (
          // Any way around this?
          chk === "overwrite" && check._zod.def.tx.toString() === "(input) => input.toUpperCase()" ? { toUpperCase: true } : chk === "overwrite" && check._zod.def.tx.toString() === "(input) => input.toLowerCase()" ? { toLowerCase: true } : chk === "overwrite" && check._zod.def.tx.toString() === "(input) => input.trim()" ? { trim: true } : (
            // No apparent check
            // : chk == "string_format" && format == "trim"
            // ? { trim: true }
            chk == "string_format" && format2 == "starts_with" ? {
              startsWith: check._zod.def.prefix
            } : chk == "string_format" && format2 == "ends_with" ? {
              endsWith: check._zod.def.suffix
            } : chk == "string_format" && format2 == "includes" ? {
              includes: check._zod.def.includes,
              position: check._zod.def.position
            } : chk == "string_format" && format2 == "regex" ? {
              regex: check._zod.def.pattern.source,
              ...check._zod.def.pattern.flags ? {
                flags: check._zod.def.pattern.flags
              } : {}
              /* c8 ignore next 2 -- Guard */
            } : {}
          )
        )
      };
    }, {});
    const format = "format" in def && def.format;
    return Object.assign(
      {
        type: "string",
        ...checks,
        ...getCustomChecksAndErrors(def, opts),
        // Check is on `def` itself
        ...format == "ipv4" ? { kind: "ip", version: "v4" } : format == "ipv6" ? { kind: "ip", version: "v6" } : format == "cidrv4" ? { kind: "cidr", version: "v4" } : format == "cidrv6" ? { kind: "cidr", version: "v6" } : format == "uuid" ? {
          kind: "uuid",
          ..."version" in def ? { version: def.version } : {}
        } : format == "jwt" ? {
          kind: "jwt",
          ..."alg" in def ? { algorithm: def.alg } : {}
        } : format == "email" ? {
          kind: "email",
          ..."pattern" in def && def.pattern && typeof def.pattern == "object" && "source" in def.pattern && "flags" in def.pattern && def.pattern.source !== z2.regexes.email.source ? {
            pattern: def.pattern.source,
            flags: def.pattern.flags
          } : {}
        } : "format" in def && STRING_KINDS.has(format) || format == "datetime" || format == "time" ? {
          kind: format,
          ..."precision" in def && def.precision ? {
            precision: def.precision
          } : {},
          ..."offset" in def && def.offset ? {
            offset: def.offset
          } : {},
          ..."local" in def && def.local ? {
            local: def.local
          } : {}
        } : {}
      },
      def.coerce ? { coerce: true } : {}
    );
  },
  boolean: (def) => Object.assign({ type: "boolean" }, def.coerce ? { coerce: true } : {}),
  nan: () => ({ type: "nan" }),
  symbol: () => ({ type: "symbol" }),
  bigint: (def, opts) => {
    const checks = def.checks?.reduce((o, check) => {
      const chk = check._zod.def.check;
      return {
        ...o,
        ...chk == "greater_than" ? {
          min: String(
            check._zod.def.value
          ),
          ...check._zod.def.inclusive ? { minInclusive: true } : {}
        } : chk == "less_than" ? {
          max: String(
            check._zod.def.value
          ),
          ...check._zod.def.inclusive ? { maxInclusive: true } : {}
        } : chk == "multiple_of" ? {
          multipleOf: String(
            check._zod.def.value
          )
          /* c8 ignore next 2 -- Guard */
        } : {}
      };
    }, {});
    return Object.assign(
      {
        type: "bigInt",
        ...checks,
        ...getCustomChecksAndErrors(def, opts),
        // Check is on `def` itself
        ..."check" in def && def.check === "bigint_format" && "format" in def ? { format: def.format } : {}
      },
      def.coerce ? { coerce: true } : {}
    );
  },
  file: (def) => {
    const checks = def.checks?.reduce((o, check) => {
      const chk = check._zod.def.check;
      return {
        ...o,
        ...chk == "min_size" ? {
          min: check._zod.def.minimum
        } : chk == "max_size" ? {
          max: check._zod.def.maximum
        } : chk == "mime_type" ? {
          mime: check._zod.def.mime
          /* c8 ignore next 2 -- Guard */
        } : {}
      };
    }, {});
    return {
      type: "file",
      ...checks
    };
  },
  date: (def, opts) => {
    const checks = def.checks?.reduce((o, check) => {
      const chk = check._zod.def.check;
      return {
        ...o,
        ...chk == "greater_than" ? {
          min: check._zod.def.value.getTime()
          // ...((check as z.core.$ZodCheckLessThan<Date>)._zod.def.inclusive
          //   ? { minInclusive: true }
          //   : {}),
        } : chk == "less_than" ? {
          max: check._zod.def.value.getTime()
          // ...((check as z.core.$ZodCheckLessThan<Date>)._zod.def.inclusive
          //   ? { maxInclusive: true }
          //   : {}),
        } : (
          /* c8 ignore next -- Guard */
          {}
        )
      };
    }, {});
    return Object.assign(
      { type: "date", ...checks, ...getCustomChecksAndErrors(def, opts) },
      def.coerce ? { coerce: true } : {}
    );
  },
  undefined: () => ({ type: "undefined" }),
  null: () => ({ type: "null" }),
  any: () => ({ type: "any" }),
  unknown: () => ({ type: "unknown" }),
  never: () => ({ type: "never" }),
  void: () => ({ type: "void" }),
  literal: (def) => ({ type: "literal", values: def.values }),
  tuple: (def, opts) => ({
    type: "tuple",
    ...getCustomChecksAndErrors(def, opts),
    items: def.items.map((item, idx) => {
      const result = s(item, {
        ...opts,
        currentPath: [...opts.currentPath, "items", String(idx)]
      });
      return result;
    }),
    ...def.rest ? {
      rest: s(def.rest, {
        ...opts,
        currentPath: [...opts.currentPath, "rest"]
      })
    } : {}
  }),
  set: (def, opts) => {
    const checks = def.checks?.reduce((o, check) => {
      const chk = check._zod.def.check;
      return {
        ...o,
        ...chk == "min_size" ? {
          minSize: check._zod.def.minimum
        } : chk == "max_size" ? {
          maxSize: check._zod.def.maximum
        } : chk == "size_equals" ? {
          minSize: check._zod.def.size,
          maxSize: check._zod.def.size
          /* c8 ignore next 2 -- Guard */
        } : {}
      };
    }, {});
    return {
      type: "set",
      value: s(def.valueType, {
        ...opts,
        currentPath: [...opts.currentPath, "value"]
      }),
      ...getCustomChecksAndErrors(def, opts),
      ...checks
    };
  },
  array: (def, opts) => {
    const checks = def.checks?.reduce((o, check) => {
      const chk = check._zod.def.check;
      return {
        ...o,
        ...chk == "min_length" ? { minLength: check._zod.def.minimum } : chk == "max_length" ? {
          maxLength: check._zod.def.maximum
        } : chk == "length_equals" ? {
          minLength: check._zod.def.length,
          maxLength: check._zod.def.length
          /* c8 ignore next 2 -- Guard */
        } : {}
      };
    }, {});
    return {
      type: "array",
      element: s(def.element, {
        ...opts,
        currentPath: [...opts.currentPath, "element"]
      }),
      ...getCustomChecksAndErrors(def, opts),
      ...checks
    };
  },
  object: (def, opts) => {
    return {
      type: "object",
      ...getCustomChecksAndErrors(def, opts),
      ...!def.catchall ? {} : {
        catchall: s(def.catchall, {
          ...opts,
          currentPath: [...opts.currentPath, "catchall"]
        })
      },
      properties: Object.fromEntries(
        Object.entries(def.shape).map(([key, schema]) => [
          key,
          s(schema, {
            ...opts,
            currentPath: [...opts.currentPath, "properties", key]
          })
        ])
      )
    };
  },
  record: (def, opts) => ({
    type: "record",
    ...getCustomChecksAndErrors(def, opts),
    key: s(def.keyType, {
      ...opts,
      currentPath: [...opts.currentPath, "key"]
    }),
    value: s(def.valueType, {
      ...opts,
      currentPath: [...opts.currentPath, "value"]
    })
  }),
  map: (def, opts) => ({
    type: "map",
    ...getCustomChecksAndErrors(def, opts),
    key: s(def.keyType, {
      ...opts,
      currentPath: [...opts.currentPath, "key"]
    }),
    value: s(def.valueType, {
      ...opts,
      currentPath: [...opts.currentPath, "value"]
    })
  }),
  enum: (def) => ({ type: "enum", values: def.entries }),
  union: (def, opts) => {
    return {
      type: "discriminator" in def ? "discriminatedUnion" : "union",
      ..."discriminator" in def ? {
        discriminator: def.discriminator
      } : {},
      ...getCustomChecksAndErrors(def, opts),
      options: def.options.map((opt, idx) => {
        const result = s(opt, {
          ...opts,
          currentPath: [...opts.currentPath, "options", String(idx)]
        });
        return result;
      })
    };
  },
  intersection: (def, opts) => ({
    type: "intersection",
    ...getCustomChecksAndErrors(def, opts),
    left: s(def.left, {
      ...opts,
      currentPath: [...opts.currentPath, "left"]
    }),
    right: s(def.right, {
      ...opts,
      currentPath: [...opts.currentPath, "right"]
    })
  }),
  promise: (def, opts) => ({
    type: "promise",
    value: s(def.innerType, {
      ...opts,
      currentPath: [...opts.currentPath, "value"]
    })
  }),
  lazy: (def, opts) => {
    const getter = def.getter();
    return s(
      getter,
      opts,
      // official equivalent for `isOptional`
      getter.safeParse(void 0).success || // official equivalent for `isNullable`
      getter.safeParse(null).success
    );
  },
  transform: (def, opts) => {
    let name = null;
    if ("transforms" in opts && opts.transforms) {
      for (const [transformName, transformItem] of Object.entries(
        opts.transforms
      )) {
        if (def.type === "transform" && transformItem === def.transform) {
          name = transformName;
          break;
        }
      }
    }
    return {
      type: "transform",
      name
      // inner: s(def.out, {
      //   ...opts,
      //   currentPath: [...opts.currentPath, "inner"],
      // }),
    };
  },
  pipe: (def, opts) => {
    if (!("transforms" in opts)) {
      return s(def.out, opts);
    }
    return {
      type: "pipe",
      ...getCustomChecksAndErrors(def, opts),
      inner: s(def.in, opts),
      outer: s(def.out, opts)
    };
  },
  catch: (def, opts) => {
    const catchValue = def.catchValue({
      value: null,
      issues: [],
      // No errors to report, so just add an empty set
      /* c8 ignore next 3 -- Unused */
      get error() {
        return new z2.ZodError([]);
      },
      // We don't have any input yet, so just provide `undefined`
      input: void 0
    });
    return {
      type: "catch",
      value: catchValue,
      innerType: s(def.innerType, opts)
    };
  },
  readonly: (def, opts) => ({
    ...s(def.innerType, opts, true),
    readonly: true
  })
};
function zerializeRefs(schema, opts, wrapReferences) {
  if (opts.seenObjects.has(schema)) {
    return wrapReferences ? {
      type: "union",
      options: [{ $ref: opts.seenObjects.get(schema) }],
      ...typeof schema.description === "string" ? {
        description: schema.description
      } : {}
    } : { $ref: opts.seenObjects.get(schema) };
  }
  const {
    _zod: { def }
  } = schema;
  const objectPath = "#" + (opts.currentPath.length ? "/" + opts.currentPath.join("/") : "");
  opts.seenObjects.set(schema, objectPath);
  const zer = zerializers[def.type](def, opts);
  if (typeof schema.description === "string") {
    zer.description = schema.description;
  }
  return zer;
}
function zerialize(schema, opts = {}) {
  if (!opts.currentPath) {
    opts.currentPath = [];
  }
  if (!opts.seenObjects) {
    opts.seenObjects = /* @__PURE__ */ new WeakMap();
  }
  return zerializeRefs(schema, opts);
}
export {
  NUMBER_FORMATS,
  PRIMITIVES,
  STRING_KINDS,
  dezerialize,
  dezerializeRefs,
  zerialize,
  zerializeRefs
};
