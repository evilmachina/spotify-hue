var Kick = function ( o ) {
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

  Kick.prototype = {
    on  : function () { 
      this.isOn = true;
      return this;
    },
    off : function () {
      this.isOn = false;
      return this;
    },

    set : function ( o ) {
      o = o || {};
      this.frequency = o.frequency !== undefined ? o.frequency : this.frequency;
      this.threshold = o.threshold !== undefined ? o.threshold : this.threshold;
      this.decay     = o.decay     !== undefined ? o.decay : this.decay;
      this.onKick    = o.onKick    || this.onKick;
      this.offKick   = o.offKick   || this.offKick;
    },

    onUpdate : function (spectrum) {
      //if ( !this.isOn ) { return; }
      var magnitude = this.maxAmplitude( this.frequency,spectrum );
      if ( magnitude >= this.currentThreshold &&
          magnitude >= this.threshold ) {
        this.currentThreshold = magnitude;
        
        return true;
        
      } else {
        this.currentThreshold -= this.decay;
        //console.log("offkick");
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