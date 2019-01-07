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
  }
export default CustomColorPicker