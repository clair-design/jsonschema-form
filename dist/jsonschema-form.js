(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.JSONSchemaForm = factory());
}(this, (function () { 'use strict';

  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  const setProp = (target, path, value, vm) => {
    const segs = path.split('.');
    let currentTarget = target;
    segs.forEach((prop, i) => {
      if (prop === '$') return
      const isLast = i === segs.length - 1;
      const match = /^(.+)\[(\d+)\]$/.exec(prop);
      if (match) { // set array item value
        const propName = match[1];
        const arrIndex = parseInt(match[2]);
        if (!Array.isArray(currentTarget[propName])) {
          vm.$set(currentTarget, propName, []);
        }
        currentTarget = currentTarget[propName];
        if (isLast) {
          vm.$set(currentTarget, arrIndex, value);
        } else if (!currentTarget[arrIndex]) {
          vm.$set(currentTarget, arrIndex, {});
        }
        currentTarget = currentTarget[arrIndex];
      } else {
        if (isLast) {
          vm.$set(currentTarget, prop, value);
        } else if (!(prop in currentTarget)) {
          vm.$set(currentTarget, prop, {});
        }
        currentTarget = currentTarget[prop];
      }
    });
  };

  const getProp = (target, path) => {
    const segs = path.split('.');
    let currentTarget = target;
    for (let i = 0; i < segs.length; i++) {
      const prop = segs[i];
      if (prop === '$') continue
      if (currentTarget === undefined || currentTarget === null) return
      const match = /^(.+)\[(\d+)\]$/.exec(prop);
      if (match) {
        const propName = match[1];
        const arrIndex = match[2];
        currentTarget = currentTarget[propName];
        if (!Array.isArray(currentTarget)) return
        currentTarget = currentTarget[arrIndex];
      } else {
        currentTarget = currentTarget[prop];
      }
    }
    return currentTarget
  };

  const getDefaultValue = type => {
    const defaultValues = {
      string: '',
      boolean: 0,
      number: 0,
      integer: 0,
      null: null,
      object: {},
      array: []
    };
    return defaultValues[type]
  };

  var CustomColorPicker = {
      name: 'CustomColorPicker',
      props: {
        value: {
          type: String,
          default: ''
        },
      },
      data() {
        return {
          inputValue: '#ff0000',
          color: '#ff0000'
        }
      },
      watch: {
        value() {
          this.inputValue = this.value;
          this.color = this.value;
          console.log(this.color);
        }
      },
      mounted() {
        this.color = this.value;
        this.inputValue = this.value;
        console.log(this.value);
        console.log(this.color);
      },
      render(h) {
        console.log(this.color);
        return h('div', {
          style: { width: '18em', display: 'inline-block' }
        }, [h('c-input', {
          props: {
            value: this.inputValue
          },
          on: {
            change: val => {
              if (val) {
                this.color = val;
                console.log(val);
                this.$emit('input', val);
              }
            }
          },
          style: { display: 'inline-block', width: '15em', verticalAlign: 'inherit' }
        }), h('c-color-picker', {
          props: {
            value: this.color
          },
          on: {
            change: val => {
              this.inputValue = val;
              this.$emit('input', val);
            }
          },
          style: { margin: '-2px' }
        })])
      }
    };

  var index = {

    props: {
      schema: {
        type: Object,
        required: true,
        default: () => ({
          properties: {}
        })
      },
      formProps: Object,
      value: {
        type: Object,
        default: () => ({})
      },
      showHeading: {
        type: Boolean,
        default: true
      }
    },
    components: {
      CustomColorPicker
    },
    watch: {
      schema: {
        immediate: true,
        handler: function () {
          let value = this._isMounted ? {} : this.value;
          const props = this.schema.properties || {};
          Object.keys(props).forEach(name => {
            const schema = props[name];
            const type = schema.type || 'string';
            if (!(name in value)) {
              let val = 'default' in schema ? schema.default : getDefaultValue(type);
              if (type === 'number' || type === 'integer') {
                if ('minimum' in schema) val = Math.max(val, schema.minimum);
                if ('maximum' in schema) val = Math.min(val, schema.maximum);
              }
              this.$set(value, name, val);
            }
          });
          if (this._isMounted) this.$refs.form.resetValidity();
          this.$emit('change', value);
        }
      }
    },

    render(h) {
      const {schema} = this;
      const children = [];

      // input fields
      const fields = this.renderSchema(h, schema, '$');
      children.push(...fields);

      // submit button
      const submit = h('c-form-item', {
        props: {label: ' '}
      }, [
        h('c-button', {
          props: {primary: true}
        }, '提交'),
        h('c-button', {
          props: {
            type: 'reset'
          },
          on: {
            click: (e) => {
              e.preventDefault();
              this.$refs.form.reset();
            }
          }
        }, '重置')
      ]);
      if (this.$slots.submitBtnBox) {
        children.push(this.$slots.submitBtnBox);
      } else 
      if (fields.length) {
        if (this.$slots.submitBtnBox) {
          children.push(this.$slots.submitBtnBox);
        } else {
          children.push(submit);
        }
      }
     

      return h('c-form', {
        props: this.formProps,
        on: {
          submit: this.onSubmit.bind(this)
        },
        ref: 'form'
      }, children)
    },

    methods: {
      /**
       * render a a json schema to form items
       * @param h {Function} Vue `createElement` function
       * @param schema {Object} the json schema Object
       * @param path {String} JSON path of the schema
       */
      renderSchema(h, schema, path) {
        const props = schema.properties || {};
        const level = path.split('.').length;
        const heading = h('div', {class: 'c-form__heading'}, [
          schema.title ? h('h' + level, schema.title) : null,
          schema.description ? h('p', schema.description) : null
        ]);
        const fields = Object.keys(props).map(propName => {
          return this.renderField(h, propName, props[propName], `${path}.${propName}`)
        });
        if (this.showHeading) fields.unshift(heading);
        return fields
      },

      /**
       * render a prop to form field
       * @param h {Function} Vue `createElement` function
       * @param propName {String} property name
       * @param schema {Object} JSON schema of the field
       */
      renderField(h, propName, schema, path) {
        const {type, title, description} = schema;
        if (type === 'object') return this.renderSchema(h, schema, path)
        if (type === 'array') return this.renderArray(h, schema, path)
        const label = title || capitalize(propName);
        const requiredFields = this.schema.required || [];
        const isRequired = requiredFields.includes(propName);
        const tipsElement = description ? h('span', {
          class: 'has-margin-left-md is-text-gray-6'
        }, description) : undefined;
        return h('c-form-item', {
          props: {
            label: `${label}:`,
            required: isRequired
          }
        }, [
          this.renderPrimitive(h, schema, path),
          tipsElement
        ])
      },

      /**
       * render string/number/boolean
       */
      renderPrimitive(h, schema, path) {
        const {type, format} = schema;
        const enums = schema.enum; // enum is reserved keyword
        const options = schema.options;
        const {value} = this;
        const rules = {};

        const propValue = getProp(value, path);
        if (propValue === undefined) {
          const defaultValue = 'default' in schema ? schema.default : getDefaultValue(type);
          setProp(value, path, defaultValue, this);
        }

        // common data object for all type of fields
        const dataObject = {
          props: {
            // value: getProp(value, path) || ('default' in schema ? schema.default : getDefaultValue(type)),
            value: getProp(value, path),
            rules
          },
          on: {
            change: val => {
              setProp(value, path, val, this);
              this.$emit('change', value);
            }
          }
        };
        let tagName = 'c-input';

        // radio group or select for enumable
        if (Array.isArray(enums)) {
          const options = enums.map(value => ({label: value, value}));
          if (enums.length <= 5) {
            tagName = 'c-radio-group';
            Object.assign(dataObject.props, {options, button: true});
          } else {
            tagName = 'c-select';
            Object.assign(dataObject.props, {options});
          }
        }

        // select for options
        if (Array.isArray(options)) {
          tagName = 'c-select';
          Object.assign(dataObject.props, {options});
        }

        // toggle TODO: replace with toggle component
        if (type === 'boolean') {
          Object.assign(dataObject.props, {
            options: [
              {value: 1, label: '是'},
              {value: 0, label: '否'}
            ],
            button: true
          });
          tagName = 'c-radio-group';
        }

        // date
        if (format === 'date') {
          tagName = 'c-datepicker';
        }

        // email
        if (format === 'email') {
          dataObject.props.rules.type = 'email';
        }

        // color
        if (format === 'color') {
          // dataObject.props.type = 'color'
          tagName = 'c-color-picker';
          // tagName = 'CustomColorPicker'
        }

        // pic upload
        if (format === 'image') {
          tagName = 'c-uploader';
        }

        // number
        if (type === 'number' || type === 'integer') {
          const useSlider = typeof schema.minimum === 'number'
            && typeof schema.maximum === 'number';
          if (useSlider) {
            tagName = 'c-slider';
            dataObject.props.min = schema.minimum;
            dataObject.props.max = schema.maximum;
            dataObject.props.value = Math.max(Math.min(schema.maximum, dataObject.props.value), schema.minimum);
            if ('multipleOf' in schema) dataObject.props.step = schema.multipleOf;
          } else {
            dataObject.props.type = 'number';
          }
          dataObject.props.rules.type = 'number';
        }

        // min / max rules
        if ('minLength' in schema) rules.minlength = schema.minLength;
        if ('maxLength' in schema) rules.maxlength = schema.maxLength;
        if ('minimum' in schema) rules.min = schema.minimum;
        if ('maximum' in schema) rules.max = schema.maximum;

        // pattern
        if (typeof schema.pattern === 'string') {
          rules.pattern = new RegExp(schema.pattern);
        }

        // default input
        return h(tagName, dataObject)
      },

      renderArray(h, schema, path) {
        const title = h('h' + path.split('.').length, schema.title);
        const initialValue = getProp(this.value, path);
        if (!Array.isArray(initialValue)) setProp(this.value, path, [], this);
        const arrayValue = initialValue || [];
        const items = arrayValue.map((value, index) => {
          const input = this.renderField(h, String(index + 1), schema.items, `${path}[${index}]`);
          const arrayItemBody = h('div', {
            staticClass: 'array-item__body'
          }, [input]);
          const removeButton = h('c-button', {
            props: {
              danger: true,
              icon: 'trash',
              type: 'button'
            },
            staticClass: 'has-margin-left-sm',
            on: {
              click: e => getProp(this.value, path).splice(index, 1)
            }
          });
          return h('div', {
            staticClass: 'array-item'
          }, [arrayItemBody, removeButton])
        });
        const addButton = h('c-button', {
          props: {
            primary: true,
            icon: 'plus',
            type: 'button'
          },
          staticClass: 'has-margin-left-sm',
          on: {
            click: e => {
              getProp(this.value, path).push(getDefaultValue(schema.items.type));
            }
          }
        });
        const heading = h('div', {
          staticClass: 'is-flex is-align-center'
        }, [title, addButton]);
        return h('div', [heading, ...items])
      },

      onSubmit(e) {
        e.preventDefault();
        this.$refs.form.isValid();
      }
    }

  }

  return index;

})));
