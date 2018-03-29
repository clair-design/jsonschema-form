(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.JSONSchemaForm = factory());
}(this, (function () { 'use strict';

  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  const defaultValues = {
    string: '',
    boolean: 0,
    number: 0,
    interger: 0,
    null: null,
    object: {},
    array: []
  };

  var index = {

    props: {
      schema: {
        type: Object,
        required: true
      },
      formProps: Object,
      value: {
        type: Object,
        default: () => ({})
      }
    },

    created () {
      // construct value object
      const props = this.schema.properties || {};
      Object.keys(props).forEach(name => {
        const type = props[name].type || 'string';
        if (!(name in this.value)) {
          this.$set(this.value, name, defaultValues[type]);
        }
      });
    },

    render (h) {
      const { schema } = this;
      const fields = this.renderSchema(h, schema);
      const submit = h('c-form-item', {
        props: { label: ' ' }
      }, [
        h('c-button', {
          props: { primary: true }
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
      return h('c-form', {
        props: this.formProps,
        on: {
          submit: this.onSubmit.bind(this)
        },
        ref: 'form'
      }, fields.concat(submit))
    },

    methods: {
      renderSchema (h, schema) {
        const props = schema.properties || {};
        const fields = Object.keys(props).map(name => {
          return this.renderField(h, {
            name,
            schema: props[name]
          })
        });
        return fields
      },
      renderField (h, prop) {
        const { name } = prop;
        const { type, title, description } = prop.schema;
        if (type === 'object') return this.renderSchema(h, prop)
        if (type === 'array') return this.renderArray(h, prop)
        const label = title || capitalize(name);
        return h('c-form-item', {
          props: {
            label: `${label}: `
          }
        }, [
          this.renderPrimitive(h, prop),
          h('span', { class: 'has-margin-left-md is-text-gray-6' }, description)
        ])
      },

      /**
       * render string/number/boolean
       */
      renderPrimitive (h, prop) {
        const { name, schema } = prop;
        const { type, format } = schema;
        const enums = schema.enum; // enum is reserved keyword
        const { value } = this;
        const requiredFields = this.schema.required || [];
        const isRequired = requiredFields.includes(prop.name);
        const rules = {
          required: isRequired
        };

        // common data object for all type of fields
        const dataObject = {
          props: {
            value: value[name],
            rules
          },
          on: {
            change: val => {
              value[name] = val;
              this.$emit('input', value);
            }
          }
        };
        let tagName = 'c-input';

        // radio group or select for enumable
        if (Array.isArray(enums)) {
          tagName = 'c-radio-group';
          const options = enums.map(value => ({ label: value, value }));
          Object.assign(dataObject.props, { options, button: true });
        }

        // toggle TODO: replace with toggle component
        if (type === 'boolean') {
          Object.assign(dataObject.props, {
            options: [
              { value: 1, label: '是' },
              { value: 0, label: '否' }
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
          dataObject.props.type = 'color';
        }

        // pic upload
        if (format === 'image') {
          tagName = 'c-uploader';
        }

        // number
        if (type === 'number') {
          const useSlider = typeof schema.minimum === 'number'
            && typeof schema.maximum === 'number';
          if (useSlider) {
            tagName = 'c-slider';
            dataObject.props.min = schema.minimum;
            dataObject.props.max = schema.maximum;
          } else {
            dataObject.props.type = 'number';
          }
        }

        // default input
        return h(tagName, dataObject)
      },

      renderArray (h, prop) {

      },

      onSubmit (e) {
        e.preventDefault();
        this.$refs.form.isValid();
      }
    }

  }

  return index;

})));
