var Beat = function ( o ) {
    o = o || {};
    this.frequency = o.frequency !== undefined ? o.frequency : [ 0, 20 ];
    this.threshold = o.threshold !== undefined ? o.threshold :  0.3;
    this.decay     = o.decay     !== undefined ? o.decay     :  0.2;
    this.onKick    = o.onKick;
    this.offKick   = o.offKick;
    this.isOn      = false;
    this.currentThreshold = this.threshold;

    var _this = this;
  };

  Beat.prototype = {

    set : function ( o ) {
      o = o || {};
      this.frequency = o.frequency !== undefined ? o.frequency : this.frequency;
      this.threshold = o.threshold !== undefined ? o.threshold : this.threshold;
      this.decay     = o.decay     !== undefined ? o.decay : this.decay;
    },

    onUpdate : function (spectrum) {
      var magnitude = this.maxAmplitude( this.frequency,spectrum );
      if ( magnitude >= this.currentThreshold &&
          magnitude >= this.threshold ) {
        this.currentThreshold = magnitude;
        
        return true;
        
      } else {
        this.currentThreshold -= this.decay;
        return false;
      }
    },
    maxAmplitude : function ( frequency, spectrum ) {
      var
        max = 0,
        fft = spectrum;

      // Sloppy array check
      if ( !frequency.length ) {
        return frequency < fft.length ?
          fft[ ~~frequency ] :
          null;
      }

      for ( var i = frequency[ 0 ], l = frequency[ 1 ]; i <= l; i++ ) {
        if ( fft[ i ] > max ) { max = fft[ i ]; }
      }
      return max;
    }
  };