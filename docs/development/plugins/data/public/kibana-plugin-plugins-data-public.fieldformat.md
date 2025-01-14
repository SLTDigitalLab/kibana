<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-plugins-data-public](./kibana-plugin-plugins-data-public.md) &gt; [FieldFormat](./kibana-plugin-plugins-data-public.fieldformat.md)

## FieldFormat class

<b>Signature:</b>

```typescript
export declare abstract class FieldFormat 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(\_params, getConfig)](./kibana-plugin-plugins-data-public.fieldformat._constructor_.md) |  | Constructs a new instance of the <code>FieldFormat</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [\_params](./kibana-plugin-plugins-data-public.fieldformat._params.md) |  | <code>any</code> |  |
|  [allowsNumericalAggregations](./kibana-plugin-plugins-data-public.fieldformat.allowsnumericalaggregations.md) |  | <code>boolean</code> |  |
|  [convertObject](./kibana-plugin-plugins-data-public.fieldformat.convertobject.md) |  | <code>FieldFormatConvert &#124; undefined</code> |  {<!-- -->FieldFormatConvert<!-- -->}  have to remove the private because of https://github.com/Microsoft/TypeScript/issues/17293 |
|  [fieldType](./kibana-plugin-plugins-data-public.fieldformat.fieldtype.md) | <code>static</code> | <code>string &#124; string[]</code> |  {<!-- -->string<!-- -->} - Field Format Type  |
|  [getConfig](./kibana-plugin-plugins-data-public.fieldformat.getconfig.md) |  | <code>FieldFormatsGetConfigFn &#124; undefined</code> |  |
|  [hidden](./kibana-plugin-plugins-data-public.fieldformat.hidden.md) | <code>static</code> | <code>boolean</code> | Hidden field formats can only be accessed directly by id, They won't appear in field format editor UI, But they can be accessed and used from code internally. {<!-- -->boolean<!-- -->} - Is this a hidden field format  |
|  [htmlConvert](./kibana-plugin-plugins-data-public.fieldformat.htmlconvert.md) |  | <code>HtmlContextTypeConvert &#124; undefined</code> |  {<!-- -->htmlConvert<!-- -->}  have to remove the protected because of https://github.com/Microsoft/TypeScript/issues/17293 |
|  [id](./kibana-plugin-plugins-data-public.fieldformat.id.md) | <code>static</code> | <code>string</code> |  {<!-- -->string<!-- -->} - Field Format Id  |
|  [textConvert](./kibana-plugin-plugins-data-public.fieldformat.textconvert.md) |  | <code>TextContextTypeConvert &#124; undefined</code> |  {<!-- -->textConvert<!-- -->}  have to remove the protected because of https://github.com/Microsoft/TypeScript/issues/17293 |
|  [title](./kibana-plugin-plugins-data-public.fieldformat.title.md) | <code>static</code> | <code>string</code> |  {<!-- -->string<!-- -->} - Field Format Title  |
|  [type](./kibana-plugin-plugins-data-public.fieldformat.type.md) |  | <code>any</code> |  {<!-- -->Function<!-- -->} - ref to child class  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [convert(value, contentType, options)](./kibana-plugin-plugins-data-public.fieldformat.convert.md) |  | Convert a raw value to a formatted string |
|  [from(convertFn)](./kibana-plugin-plugins-data-public.fieldformat.from.md) | <code>static</code> |  |
|  [getConverterFor(contentType)](./kibana-plugin-plugins-data-public.fieldformat.getconverterfor.md) |  | Get a convert function that is bound to a specific contentType |
|  [getParamDefaults()](./kibana-plugin-plugins-data-public.fieldformat.getparamdefaults.md) |  | Get parameter defaults  {<!-- -->object<!-- -->} - parameter defaults |
|  [isInstanceOfFieldFormat(fieldFormat)](./kibana-plugin-plugins-data-public.fieldformat.isinstanceoffieldformat.md) | <code>static</code> |  |
|  [param(name)](./kibana-plugin-plugins-data-public.fieldformat.param.md) |  | Get the value of a param. This value may be a default value. |
|  [params()](./kibana-plugin-plugins-data-public.fieldformat.params.md) |  | Get all of the params in a single object  {<!-- -->object<!-- -->} |
|  [setupContentType()](./kibana-plugin-plugins-data-public.fieldformat.setupcontenttype.md) |  |  |
|  [toJSON()](./kibana-plugin-plugins-data-public.fieldformat.tojson.md) |  | Serialize this format to a simple POJO, with only the params that are not default {<!-- -->object<!-- -->} |

