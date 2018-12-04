BaseBitLength = 24;
Base = 1 << BaseBitLength;
BaseMask = Base - 1;
BaseInv = 1 / Base;
HalfBase = 1 << (BaseBitLength - 1);

// Conversion Functions
bytetoBitArray = function(byte) {
  return [(byte >>> 7) & 1, (byte >>> 6) & 1, (byte >>> 5) & 1, (byte >>> 4) & 1, (byte >>> 3) & 1, (byte >>> 2) & 1, (byte >>> 1) & 1, byte & 1];
}

uint32toBitArray = function(ui32) {
  var bitArray = [];
  for (var i = 31; i >= 0; i--) {
    bitArray.push((ui32 >>> i) & 1);
  }
  return bitArray;
}

uint32ArraytoBitArray = function(ui32Array) {
  var bitArray = [];
  for (var i = 0; i < ui32Array.length; i++) {
    bitArray = bitArray.concat(uint32toBitArray(ui32Array[i]));
  }
  return bitArray;
}

// Compliant with the C library
bitArrayReordering = function(bitArray) {
  var i, j;
  var l = bitArray.length;
  var newbitArray = [];
  var s = Math.floor(l / 32);
  var t = l - s * 32;
  for (i = 1; i <= s; i++) {
    for(j = l - i*32; j < l - (i - 1)*32; j++) {
      newbitArray.push(bitArray[j]);
    }
  }
  for(j = 0; j < t; j++) {
    newbitArray.push(bitArray[j]);
  }
  return newbitArray;
}

bitArraytoByteArray = function(bitArray) {
  var bitLen = bitArray.length;
  var byteArray = [];
  var bytePos = 0;
  var byte = 0;
  var i, j;
  for (i = 0, j = 7; i < bitLen; i++, j--) {
    byte |= (bitArray[i] << j);
    if (j == 0) {
      byteArray[bytePos++] = byte;
      j = 8;
      byte = 0;
    }
  }
  return byteArray;
}

bitArraytoHex = function(bitArray, minHexLength) {
  var s = "";
  var d = 0;
  var i = 0;
  var extraBits = bitArray.length & 3;
  if (extraBits > 0) {
    for ( ; i < extraBits; i++) {
      d |= bitArray[i] << (extraBits - 1 - i);
    }
    s += d.toString(16);
    d = 0;
  }
  for (var j = 3; i < bitArray.length; i++, j--) {
    d |= (bitArray[i] << j);
    if (j == 0) {
      s += d.toString(16);
      j = 4;
      d = 0;
    }
  }
  if (minHexLength === undefined) {
    return s;
  }
  var prefix = "";
  for (var k = 0; k < minHexLength - s.length; k++) {
    prefix += "0";
  }
  return prefix + s;
}

hextoBitArray = function(s) {
  var i;
  var bitArray = [];
  for (i = 0; i < s.length; i++) {
    switch (s.charAt(i)) {
      case "0":
        bitArray.push(0,0,0,0);
        break;

      case "1":
        bitArray.push(0,0,0,1);
        break;

      case "2":
        bitArray.push(0,0,1,0);
        break;

      case "3":
        bitArray.push(0,0,1,1);
        break;

      case "4":
        bitArray.push(0,1,0,0);
        break;

      case "5":
        bitArray.push(0,1,0,1);
        break;

      case "6":
        bitArray.push(0,1,1,0);
        break;

      case "7":
        bitArray.push(0,1,1,1);
        break;

      case "8":
        bitArray.push(1,0,0,0);
        break;

      case "9":
        bitArray.push(1,0,0,1);
        break;

      case "a":
      case "A":
        bitArray.push(1,0,1,0);
        break;

      case "b":
      case "B":
        bitArray.push(1,0,1,1);
        break;

      case "c":
      case "C":
        bitArray.push(1,1,0,0);
        break;

      case "d":
      case "D":
        bitArray.push(1,1,0,1);
        break;

      case "e":
      case "E":
        bitArray.push(1,1,1,0);
        break;

      case "f":
      case "F":
        bitArray.push(1,1,1,1);
        break;

      default:
        throw new Error("Argument is not a hex string!");
    }
  }
  return bitArray;
}

bitArraytoBigInt = function(bitArray) {
  bitArray = bitArray.concat().reverse();
  var finalArray = [];
  var counter = 0;
  var limb = 0;
  var i,j;
  for (i = j = 0; i < bitArray.length; i++, j++) {
    limb |= (bitArray[i] << j);
    if (j == BaseBitLength - 1) {
      finalArray[counter] = limb;
      j = -1;
      counter = counter + 1;
      limb = 0;
    }
  }
  if (j != -1) {
    finalArray[counter] = limb;
  }
  var l = finalArray.length;
  while (l > 0) {
    if (finalArray[--l] != 0) {
      l++;
      break;
    }
  }
  finalArray.length = l;
  return finalArray;
}

hextoBigInt = function(s) {
  var bitArray = hextoBitArray(s);
  return bitArraytoBigInt(bitArray);
}

bigInttoHex = function(x, minHexLength) {
  return bitArraytoHex(bigInttoBitArray(x), minHexLength);
}

bigInttoBitArray = function(x) {
  var bitArray = [];
  for (var i = x.length - 1; i >= 0; i--) {
    var u = x[i];
    for (var j = BaseBitLength - 1; j >= 0; j--) {
      bitArray.push((u >>> j) & 1);
    }
  }
  while (bitArray.length > 0 && bitArray[0] == 0) {
    bitArray.shift();
  }
  return bitArray;
}

bigInttoSizedBitArray = function(x, size) {
  var bitArray = [];
  for (var i = x.length - 1; i >= 0; i--) {
    var u = x[i];
    for (var j = BaseBitLength - 1; j >= 0; j--) {
      bitArray.push((u >>> j) & 1);
    }
  }
  if (size > bitArray.length) {
    for (var i = 0; i < size - bitArray.length; i++) {
      bitArray.unshift(0);
    }
  }
  else if (bitArray.length > size) {
    bitArray.splice(0, bitArray.length - size);
  }
  return bitArray;
}

bitLengthOfBigInt = function(x) {
  var l = x.length;
  if (l-- == 0) {
    return 0;
  }
  var i = HalfBase;
  var j = BaseBitLength;
  while (true) {
    if ((i & x[l]) != 0) {
      break;
    }
    i = i >>> 1;
    j--;
  }
  return j + BaseBitLength * l;
}

// BLAKE-256 Hash Function
var blake256IV = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];

var blake256Sigma = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8]
];

var blake256CST = [
  0x243f6a88,0x85a308d3,0x13198a2e,0x03707344,0xa4093822,0x299f31d0,0x082efa98,0xec4e6c89,
  0x452821e6,0x38d01377,0xbe5466cf,0x34e90c6c,0xc0ac29b7,0xc97c50dd,0x3f84d5b5,0xb5470917];

var blake256P = new Uint8Array([
  0x80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);

var blake256Pa = new Uint8Array([0x01]);
var blake256Pb = new Uint8Array([0x81]);

blakeLoad32BE = function(v, i) {
  return (v[i] << 24) ^ (v[i + 1] << 16) ^ (v[i + 2] << 8) ^ v[i + 3];
}

blakeStore32BE = function(u, v, i) {
  u[i] = (v >>> 24) & 0xff;
  u[i + 1] = (v >>> 16) & 0xff;
  u[i + 2] = (v >>> 8) & 0xff;
  u[i + 3] = v & 0xff;
  return u;
}

blake256ROTR = function(x, n) {
  return ((x >>> n) ^ (x << (32 - n))) >>> 0;
}

blake256G = function(v, m, i, a, b, c, d, e) {
  v[a] = (v[a] + ((m[blake256Sigma[i][e]] ^ blake256CST[blake256Sigma[i][e + 1]]) >>> 0) + v[b]) >>> 0;
  v[d] = blake256ROTR(v[d] ^ v[a], 16);
  v[c] = (v[c] + v[d]) >>> 0;
  v[b] = blake256ROTR(v[b] ^ v[c], 12);
  v[a] = (v[a] + ((m[blake256Sigma[i][e + 1]] ^ blake256CST[blake256Sigma[i][e]]) >>> 0) + v[b]) >>> 0;
  v[d] = blake256ROTR(v[d] ^ v[a], 8);
  v[c] = (v[c] + v[d]) >>> 0;
  v[b] = blake256ROTR(v[b] ^ v[c], 7);
}

blake256Init = function() {
  var blake256Ctx = {
    h: new Uint32Array(blake256IV),
    s: new Uint32Array(4),
    t: new Uint32Array(2),
    buf: new Uint8Array(64),
    buflen: 0,
    nullt: false
  }
  return blake256Ctx;
}

blake256Compress = function(ctx) {
  var v = new Uint32Array(16);
  var m = new Uint32Array(16);
  var i;
  for (i = 0; i < 16; i++) {
    m[i] = blakeLoad32BE(ctx.buf, i*4);
  }
  for (i = 0; i < 8; i++) {
    v[i] = ctx.h[i] >>> 0;
  }
  for (i = 8; i < 12; i++) {
    v[i] = (ctx.s[i - 8] ^ blake256CST[i - 8]) >>> 0;
  }
  for (i = 12; i < 16; i++) {
    v[i] = blake256CST[i - 8];
  }
  if(!ctx.nullt) {
    v[12] = (v[12] ^ ctx.t[0]) >>> 0;
    v[13] = (v[13] ^ ctx.t[0]) >>> 0;
    v[14] = (v[14] ^ ctx.t[1]) >>> 0;
    v[15] = (v[15] ^ ctx.t[1]) >>> 0;
  }
  for (i = 0; i < 14; i++) {
    blake256G(v, m, i, 0, 4, 8, 12, 0);
    blake256G(v, m, i, 1, 5, 9, 13, 2);
    blake256G(v, m, i, 2, 6, 10, 14, 4);
    blake256G(v, m, i, 3, 7, 11, 15, 6);
    blake256G(v, m, i, 0, 5, 10, 15, 8);
    blake256G(v, m, i, 1, 6, 11, 12, 10);
    blake256G(v, m, i, 2, 7, 8, 13, 12);
    blake256G(v, m, i, 3, 4, 9, 14, 14);
  }
  for (i = 0; i < 16; i++) {
    ctx.h[i % 8] = (ctx.h[i % 8] ^ v[i]) >>> 0;
  }
  for (i = 0; i < 8; i++) {
    ctx.h[i] = (ctx.h[i] ^ ctx.s[i % 4]) >>> 0;
  }
}

blake256Update = function(ctx, data) {
  var offset = 0;
  while (ctx.buflen + data.length - offset >= 64) {
    for (var i = ctx.buflen; i < 64; ) {
      ctx.buf[i++] = data[offset++];
    }
    ctx.t[0] += 512;
    if (ctx.t[0] >= 0x0100000000) {
      ctx.t[0] -= 0x0100000000;
      ctx.t[1] += 1;
    }
    blake256Compress(ctx);
    ctx.buflen = 0;
  }
  while (offset < data.length) {
    ctx.buf[ctx.buflen++] = data[offset++];
  }
}

blake256Padding = function(ctx) {
  var lo = ctx.t[0] + ctx.buflen * 8;
  var hi = ctx.t[1];
  if (lo >= 0x0100000000) {
    lo -= 0x0100000000
    hi += 1
  }
  var msglen = new Uint8Array(8);
  blakeStore32BE(msglen, hi, 0);
  blakeStore32BE(msglen, lo, 4);
  if (ctx.buflen === 55) {
    ctx.t[8] -= 8;
    blake256Update(ctx, blake256Pb);
  } else {
    if (ctx.buflen < 55) {
      if (ctx.buflen === 0) {
        ctx.nullt = true;
      }
      ctx.t[0] -= (55 - ctx.buflen) * 8;
      blake256Update(ctx, blake256P.slice(0, 55 - ctx.buflen));
    } else {
      ctx.t[0] -= (64 - ctx.buflen) * 8;
      blake256Update(ctx, blake256P.slice(0, 64 - ctx.buflen));
      ctx.t[0] -= 55 * 8;
      blake256Update(ctx, blake256P.slice(1, 1 + 55));
      ctx.nullt = true;
    }
    blake256Update(ctx, blake256Pa);
    ctx.t[0] -= 8;
  }
  ctx.t[0] -= 64;
  blake256Update(ctx, msglen);
}

blake256Hash = function(inBitArray) {
  var msg = bitArraytoByteArray(inBitArray);
  var bctx = blake256Init();
  blake256Update(bctx, msg);
  blake256Padding(bctx);
  return uint32ArraytoBitArray(bctx.h);
}

// DRBG based on the BLAKE-256 Hash Function
rbg128Instantiate = function(rbgStateStorage, entropy, nonce) {
  var seedLength = 440;
  if (nonce === undefined) {
    nonce = uint32toBitArray((new Date()).getTime());
  }
  var seedMaterial = entropy.concat(nonce);
  var seed = hash256DF(seedMaterial, seedLength);
  var x = [0,0,0,0,0,0,0,0].concat(seed);
  var c = hash256DF(x, seedLength);
  rbgStateStorage.v = bitArraytoHex(seed);
  rbgStateStorage.c = bitArraytoHex(c);
  rbgStateStorage.rc = "1";
}

hash256DF = function(inBitArray, outBitLength) {
  var t = [];
  var hashLength = 256;
  var l = Math.ceil(outBitLength / hashLength);
  var counter = 1;
  for (var i = 1; i <= l; i++) {
    var hashIn = bytetoBitArray(counter).concat(uint32toBitArray(outBitLength)).concat(inBitArray);
    t = t.concat(blake256Hash(hashIn));
    counter += 1;
  }
  return t.slice(0, outBitLength);
}

rbg128Reseed = function(rbgStateStorage, entropy) {
  var v = hextoBitArray(rbgStateStorage.v);
  var c = hextoBitArray(rbgStateStorage.c);
  var securityStrength = 128;
  if (entropy.length < securityStrength) {
    throw new Error(" entropy is less than security strength in rbg128Reseed and reseed terminated! ");
  }
  var seedLength = 440;
  var seedMaterial = [0,0,0,0,0,0,0,1].concat(v).concat(entropy);
  var seed = hash256DF(seedMaterial, seedLength);
  var x = [0,0,0,0,0,0,0,0].concat(seed);
  var c = hash256DF(x, seedLength);
  rbgStateStorage.v = bitArraytoHex(seed);
  rbgStateStorage.c = bitArraytoHex(c);
  rbgStateStorage.rc = "1";
}

rbg128InstantiateOrReseed = function(rbgStateStorage, entropy, nonce) {
  var securityStrength = 128;
  if (entropy.length < securityStrength) {
    throw new Error(" Entropy bit array must have at least 128 bits! ");
  }
  if (wellFormedRBG128State(rbgStateStorage)) {
    if (nonce) {
      entropy = entropy.concat(nonce);
    }
    rbg128Reseed(rbgStateStorage, entropy);
  }
  else {
    rbg128Instantiate(rbgStateStorage,entropy,nonce);
  }
}

rbg128Gen = function(rbgStateStorage, bitLength) {
  var v = hextoBitArray(rbgStateStorage.v);
  var c = hextoBigInt(rbgStateStorage.c);
  var counter = hextoBigInt(rbgStateStorage.rc);
  if (counter.length > 2) {
    throw new Error(" reseed counter is greater than or equal to 2^48 and DRBG must be reseeded! ");
  }
  var hashLength = 256;
  var seedLength = 440;
  var m = Math.ceil(bitLength / hashLength);
  var w = [];
  var data = v;
  var i = 1;
  while (true) {
    w = w.concat(blake256Hash(data));
    if (i == m) {
      break;
    }
    data = bigInttoSizedBitArray(bigIntAdd(bitArraytoBigInt(data), [1]), seedLength);
    i++;
  }
  var bitArray = w.slice(0, bitLength);
  var h = blake256Hash([0,0,0,0,0,0,1,1].concat(v));
  var v1 = bigIntAdd(bitArraytoBigInt(v), bitArraytoBigInt(h));
  var v2 = bigIntAdd(c, counter);
  v = bigInttoSizedBitArray(bigIntAdd(v1, v2), seedLength);
  counter = bigIntAdd(counter, [1]);
  rbgStateStorage.v = bitArraytoHex(v);
  rbgStateStorage.rc = bigInttoHex(counter);
  return bitArray;
}

hashBasedRBG = function(rbgStateStorage, requestedSecStrength, bitLength) {
  if (requestedSecStrength > 128) {
    throw new Error("Requested security strength is not available! ");
  }
  return rbg128Gen(rbgStateStorage, bitLength);
}

// Biginteger and finite field functions
strictGreaterThan = function(a, b) {
  var la = a.length;
  var lb = b.length;
  if (la > lb) {
    return true;
  }else if (la < lb) {
    return false;
  } else {
    for (var i = la - 1; i >= 0; i--) {
      if (a[i] > b[i]) {
        return true;
      }
      if (a[i] < b[i]) {
        return false;
      }
    }
    return false;
  }
}

greaterThanOrEqual = function(a, b) {
  var la = a.length;
  var lb = b.length;
  if (la > lb) {
    return true;
  } else if (la < lb) {
    return false;
  } else {
    for (var i = la - 1; i >= 0; i--) {
      if (a[i] > b[i]) {
        return true;
      }
      if (a[i] < b[i]) {
        return false;
      }
    }
    return true;
  }
}

equal = function(a, b) {
  if (a.length != b.length) {
    return false;
  }
  for (var i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}

shiftLeftwithinBaseBitLength = function(a, k) {
  // Shift an integer a to the left by k bits (k < BaseBitLength)
  var la = a.length;
  if (la == 0) {
    return;
  }
  a[la] = 0;
  for (var i = la; i > 0; i--) {
    a[i] |= a[i - 1] >>> (BaseBitLength - k);
    a[i - 1] = (a[i - 1] << k) & BaseMask;
  }
  if (a[la] == 0) {
    a.length = la;
  }
}

shiftLeftArbitray = function(a, k) {
  // Shift an integer a to the left by k bits (k is a non-negative integer)
  var la = a.length;
  if (la == 0) {
    return;
  }
  var s = Math.floor(k / BaseBitLength);
  var t = k - s * BaseBitLength;
  shiftLeftwithinBaseBitLength(a, t);
  for (var i = 0; i < s; i++) {
    a.unshift(0);
  }
}

shiftRightwithinBaseBitLength = function(a, k) {
  // Shift an integer a to the right by k bits (k is a non-negative integer less than BaseBitLength)
  var la = a.length;
  if (la == 0) {
    return;
  }
  for (var i = 0; i + 1 < la; i++) {
    a[i] >>>= k;
    a[i] |= (a[i + 1] << (BaseBitLength - k)) & BaseMask;
  }
  a[la - 1] >>>= k;
  if (a[la - 1] == 0) {
    a.length = la - 1;
  }
}

shiftRightArbitray = function(a, k) {
  // Shift an integer a to the right by k bits (k is a non-negative integer)
  var la = a.length;
  if (la == 0){
    return;
  }
  var s = Math.floor(k / BaseBitLength);
  var t = k - s * BaseBitLength;
  shiftRightwithinBaseBitLength(a, t);
  for (var i = 0; i < s; i++){
    a.shift();
  }
  if (a.negative && a.length == 0) {
    delete a.negative;
  }
}

truncateToFixedBitLength = function(a, t) {
  // Truncate a biginteger to t bits
  var s = t / BaseBitLength;
  var n = Math.ceil(s);
  if (a.length < n) {
    return;
  }
  a.length = n;
  var m = Math.floor(s);
  var o = t - m * BaseBitLength;
  if (o != 0) {
    a[m] &= 0xffffffff >>> (32 - o);
  }
  while (n > 0) {
    if (a[--n] != 0) {
      n++;
      break;
    }
  }
  a.length = n;
}

// Finite Field GF(p) Arithmetic
bigIntAdd = function(a, b) {
  // Big Integer Addition
  var c = [];
  var la = a.length;
  var lb = b.length;
  var lo, ls, ll;
  if (la < lb) {
    ls = la;
    ll = lb;
    lo = b;
  }
  else {
    ls = lb;
    ll = la;
    lo = a;
  }
  var carry = 0;
  for (var i = 0; i < ls; i++) {
    c[i] = a[i] + b[i] + carry;
    if (c[i] >= Base) {
      carry = 1;
      c[i] -= Base;
    }
    else {
      carry = 0;
    }
  }
  for (var j = ls; j < ll; j++) {
    c[j] = lo[j] + carry;
    if (c[j] >= Base) {
      carry = 1;
      c[j] -= Base;
    }
    else {
      carry = 0;
    }
  }
  if (carry == 1) {
    c[ll] = 1;
  }
  return c;
}

bigIntSub = function(a, b) {
  // Big Integer Subtraction
  var c = [];
  var la = a.length
  var lb = b.length;
  var carry = 0;
  var i;
  for (i = 0; i < lb; i++) {
    if (carry == 1) {
      if (b[i] > a[i] - 1) {
        c[i] = Base + (a[i] - 1) - b[i];
        carry = 1;
      }
      else {
        c[i] = (a[i] - 1) - b[i];
        carry = 0;
      }
    }
    else if (b[i] > a[i]) {
      c[i] = Base + a[i] - b[i];
      carry = 1;
    }
    else {
      c[i] = a[i] - b[i];
      carry = 0;
    }
  }
  for ( ; i < la; i++) {
    if (carry == 1) {
      if (a[i] == 0) {
        c[i] = Base - 1 ;
        carry = 1;
      }
      else {
        c[i] = (a[i] - 1);
        carry = 0;
      }
    }
    else {
      c[i] = a[i];
      carry = 0;
    }
  }
  var l = la;
  while (l > 0) {
    if (c[--l] != 0) {
      l++;
      break;
    }
  }
  c.length = l;
  return c;
}

bigIntMul = function(a, b) {
  // Big Integer Multiplication
  var c = [];
  var m = a.length;
  var n = b.length;
  var i, j, k, l, u, v, carry;
  if (m == 0 || n == 0) {
    return [];
  }
  if (m == 1 && a[0] == 1) {
    return b;
  }
  if (n == 1 && b[0] == 1) {
    return a;
  }
  for (i = 0; i < m + n; i++) {
    c[i] = 0;
  }
  for (i = j = 0; i < m; i = j) {
    for ( ; j < m && j < i + 32; j++) {
      for (k = 0; k < n; k++) {
        c[j + k] += a[j] * b[k];
      }
    }
    carry = 0;
    for (l = i; l < j + n - 1; l++) {
      u = c[l] + carry;
      v = u & BaseMask;
      c[l] = v;
      carry = (u - v) * BaseInv;
    }
    c[l] = carry;
  }
  if (c[m + n - 1] == 0) {
    c.length = m + n - 1;
  }
  return c;
}

gfpModRed = function(z, p, mu) {
  //Barrett reduction
  var q1 = z.slice(p.length - 1, z.length);
  var q2 = bigIntMul(q1, mu);
  var q = q2.slice(p.length + 1, q2.length);
  var r1 = z.slice(0, p.length + 1);
  var r2 = bigIntMul(q, p);
  var r3 = r2.slice(0, p.length + 1);
  var b = Array.from(Array(p.length), () => 0).concat([1]);
  var r = greaterThanOrEqual(r1, r3) ? bigIntSub(r1, r3) : bigIntSub(bigIntAdd(r1, b), r3);
  while (greaterThanOrEqual(r, p)) {
    r = bigIntSub(r, p);
  }
  return r;
}

gfpModAdd = function(a, b, p) {
  // Modular addition over GF(p)
  var c = bigIntAdd(a, b);
  return greaterThanOrEqual(c, p) ? bigIntSub(c, p) : c;
}

gfpModSub = function(a, b, p) {
  // Modular subtraction over GF(p)
  return greaterThanOrEqual(a, b) ? bigIntSub(a, b) : bigIntSub(bigIntAdd(a, p), b);
}

gfpModMul = function(a, b, p, mu) {
  // Modular multiplication over GF(p)
  return gfpModRed(bigIntMul(a, b), p, mu);
}

gfpModInv = function(a, p) {
  // Modular inversion over GF(p)
  var u = a.slice(0);
  var v = p.slice(0);
  var g1 = [1];
  var g2 = [];

  while (!((u.length == 1 && u[0] == 1) || (v.length == 1 && v[0] == 1))) {
    while ((u[0] & 1) == 0) {
      shiftRightwithinBaseBitLength(u, 1);
      if ((g1[0] & 1) != 0) {
        g1 = bigIntAdd(g1, p);
      }
      shiftRightwithinBaseBitLength(g1, 1);
    }

    while ((v[0] & 1) == 0) {
      shiftRightwithinBaseBitLength(v, 1);
      if ((g2[0] & 1) != 0) {
        g2 = bigIntAdd(g2, p);
      }
      shiftRightwithinBaseBitLength(g2, 1);
    }

    if (greaterThanOrEqual(u, v)) {
      u = bigIntSub(u, v);
      if(strictGreaterThan(g2, g1)) {
        g1 = bigIntAdd(g1, p);
      }
      g1 = bigIntSub(g1, g2);
    } else {
      v = bigIntSub(v, u);
      if(strictGreaterThan(g1, g2)) {
        g2 = bigIntAdd(g2, p);
      }
      g2 = bigIntSub(g2, g1);
    }
  }

  if (u.length == 1 && u[0] == 1) {
    return g1;
  } else {
    return g2;
  }
}

// Finite Field GF(2^n) Arithmetic
gf2nAdd = function(a, b) {
  // Addition over GF(2^n)
  c = [];
  var la = a.length;
  var lb = b.length;
  var ls, ll, lo;
  if (la < lb) {
    ls = la;
    ll = lb;
    lo = b;
  }
  else {
    ls = lb;
    ll = la;
    lo = a;
  }
  for (var i = 0; i < ls; i++) {
    c[i] = a[i] ^ b[i];
  }
  for (var j = ls; j < ll; j++) {
    c[j] = lo[j];
  }
  var l = ll;
  while (l > 0) {
    if (c[--l] != 0) {
      l++;
      break;
    }
  }
  c.length = l;
  return c;
}

gf2nMul = function(a, b) {
  // Polynomial multiplication over GF(2^n)
  var la = a.length;
  var lb = b.length;
  if (la == 0 || lb == 0) {
    return [];
  }
  if (la == 1 && a[0] == 1) {
    return b;
  }
  if (lb == 1 && b[0] == 1) {
    return a;
  }
  var s = [];
  var t = [];
  var a1 = a.slice(0);
  var a2 = a.slice(0);
  var a3 = a.slice(0);
  var i, j, k, u;
  // Precomputation
  for (i = 0; i < la + lb; i++) {
    t[i] = 0;
  }
  s[0] = a;
  shiftLeftwithinBaseBitLength(a1, 1);
  s[1] = a1;
  shiftLeftwithinBaseBitLength(a2, 2);
  s[3] = a2;
  shiftLeftwithinBaseBitLength(a3, 3);
  s[7] = a3;
  s[2] = gf2nAdd(s[1], s[0]);
  s[4] = gf2nAdd(s[3], s[0]);
  s[5] = gf2nAdd(s[3], s[1]);
  s[6] = gf2nAdd(s[5], s[0]);
  s[8] = gf2nAdd(s[7], s[0]);
  s[9] = gf2nAdd(s[7], s[1]);
  s[10] = gf2nAdd(s[9], s[0]);
  s[11] = gf2nAdd(s[7], s[3]);
  s[12] = gf2nAdd(s[11], s[0]);
  s[13] = gf2nAdd(s[11], s[1]);
  s[14] = gf2nAdd(s[13], s[0]);
  // Main loop
  for (i = 5; i > 0; i--) {
    for (j = lb - 1; j > -1; j--) {
      u = (b[j] >>> (i*4)) & 0xf;
      if (u > 0) {
        u--;
        for (k = s[u].length - 1; k > -1; k--) {
          t[j + k] ^= s[u][k];
        }
      }
    }
    shiftLeftwithinBaseBitLength(t, 4);
  }
  // Last iteration
  for (j = lb - 1; j > -1; j--) {
    u = b[j] & 0xf;
    if (u > 0) {
      u--;
      for (k = s[u].length - 1; k > -1; k--) {
        t[j + k] ^= s[u][k];
      }
    }
  }
  var l = la + lb;
  while (l > 0) {
    if (t[--l] != 0) {
      l++;
      break;
    }
  }
  t.length = l;
  return t;
}

gf2nSq = function(a) {
  // Polynomial squaring over GF(2^n)
  var la = a.length;
  if (la == 0) {
    return [];
  }
  if (la == 1 && a[0] == 1) {
    return [1];
  }
  var s = [];
  var i;
  // Precomputation table
  var T = [
    0,1,4,5,16,17,20,21,64,65,68,69,80,81,84,85,256,257,260,261,272,273,276,277,320,321,324,
    325,336,337,340,341,1024,1025,1028,1029,1040,1041,1044,1045,1088,1089,1092,1093,1104,1105,
    1108,1109,1280,1281,1284,1285,1296,1297,1300,1301,1344,1345,1348,1349,1360,1361,1364,1365
  ];
  for (i = 0; i < 2*la; i++) {
    s[i] = 0;
  }
  for (i = 0; i < la ; i++) {
    s[2*i] = T[a[i] & 0x3f] | (T[(a[i] >>> 6) & 0x3f] << 12);
    s[2*i+1] = T[(a[i] >>> 12) & 0x3f] | (T[(a[i] >>> 18) & 0x3f] << 12);
  }
  var l = 2*la;
  while (l > 0) {
    if (s[--l] != 0) {
      l++;
      break;
    }
  }
  s.length = l;
  return s;
}

gf2nSqrt = function(a, sc) {
  var e = [];
  var o = [];
  var la = a.length;
  var i, j;
  // Precomputation tables
  var evens = [
    0,1,0,1,2,3,2,3,0,1,0,1,2,3,2,3,4,5,4,5,6,7,6,7,4,5,4,5,6,7,6,7,0,1,0,1,2,3,2,3,0,1,0,1,2,3,2,
    3,4,5,4,5,6,7,6,7,4,5,4,5,6,7,6,7,8,9,8,9,10,11,10,11,8,9,8,9,10,11,10,11,12,13,12,13,14,15,14,
    15,12,13,12,13,14,15,14,15,8,9,8,9,10,11,10,11,8,9,8,9,10,11,10,11,12,13,12,13,14,15,14,15,12,
    13,12,13,14,15,14,15,0,1,0,1,2,3,2,3,0,1,0,1,2,3,2,3,4,5,4,5,6,7,6,7,4,5,4,5,6,7,6,7,0,1,0,1,2,
    3,2,3,0,1,0,1,2,3,2,3,4,5,4,5,6,7,6,7,4,5,4,5,6,7,6,7,8,9,8,9,10,11,10,11,8,9,8,9,10,11,10,11,
    12,13,12,13,14,15,14,15,12,13,12,13,14,15,14,15,8,9,8,9,10,11,10,11,8,9,8,9,10,11,10,11,12,13,
    12,13,14,15,14,15,12,13,12,13,14,15,14,15
  ];
  var odds = [
    0,0,1,1,0,0,1,1,2,2,3,3,2,2,3,3,0,0,1,1,0,0,1,1,2,2,3,3,2,2,3,3,4,4,5,5,4,4,5,5,6,6,7,7,6,6,7,
    7,4,4,5,5,4,4,5,5,6,6,7,7,6,6,7,7,0,0,1,1,0,0,1,1,2,2,3,3,2,2,3,3,0,0,1,1,0,0,1,1,2,2,3,3,2,2,
    3,3,4,4,5,5,4,4,5,5,6,6,7,7,6,6,7,7,4,4,5,5,4,4,5,5,6,6,7,7,6,6,7,7,8,8,9,9,8,8,9,9,10,10,11,11,
    10,10,11,11,8,8,9,9,8,8,9,9,10,10,11,11,10,10,11,11,12,12,13,13,12,12,13,13,14,14,15,15,14,14,15,
    15,12,12,13,13,12,12,13,13,14,14,15,15,14,14,15,15,8,8,9,9,8,8,9,9,10,10,11,11,10,10,11,11,8,8,9,
    9,8,8,9,9,10,10,11,11,10,10,11,11,12,12,13,13,12,12,13,13,14,14,15,15,14,14,15,15,12,12,13,13,12,
    12,13,13,14,14,15,15,14,14,15,15
  ];
  if (la == 0) {
    return [];
  }
  if (la == 1 && a[0] == 1) {
    return [1];
  }
  for (i = 0; i < Math.floor(la/2); i++) {
    j = a[2*i] & 0xff;
    e[i] = evens[j];
    o[i] = odds[j];
    j = (a[2*i] >>> 8) & 0xff;
    e[i] |= evens[j] << 4;
    o[i] |= odds[j] << 4;
    j = (a[2*i] >>> 16) & 0xff;
    e[i] |= evens[j] << 8;
    o[i] |= odds[j] << 8;

    j = a[2*i+1] & 0xff;
    e[i] |= evens[j] << 12;
    o[i] |= odds[j] << 12;
    j = (a[2*i+1] >>> 8) & 0xff;
    e[i] |= evens[j] << 16;
    o[i] |= odds[j] << 16;
    j = (a[2*i+1] >>> 16) & 0xff;
    e[i] |= evens[j] << 20;
    o[i] |= odds[j] << 20;
  }
  if (la % 2 == 1) {
    j = a[2*i] & 0xff;
    e[i] |= evens[j];
    o[i] |= odds[j];
    j = (a[2*i] >>> 8) & 0xff;
    e[i] |= evens[j] << 4;
    o[i] |= odds[j] << 4;
    j = (a[2*i] >>> 16) & 0xff;
    e[i] |= evens[j] << 8;
    o[i] |= odds[j] << 8;
  }
  for (i = 0; i < sc.length; i++) {
    var t = o.slice(0);
    shiftLeftArbitray(t, sc[i]);
    e = gf2nAdd(e, t);
  }
  return e;
}

gf2nModAdd = function(a, b, f) {
  // Modular addition over GF(2^n)
  return gf2nAdd(a, b);
}

gf2nFastModRed = function(a, t, fr, lr, f) {
  var q = a.concat();
  var r = [];
  while (true) {
    var s = q.concat();
    truncateToFixedBitLength(s, t);
    r = gf2nAdd(r, s);
    shiftRightArbitray(q, t);
    if (q.length == 0) {
      break;
    }
    q = fr(q);
  }
  if (greaterThanOrEqual(r, f)) {
    r = lr(r);
  }
  return r;
}

gf2nModMul = function(a, b, t, fr, lr, f) {
  // Modular multiplication over GF(2^n)
  return gf2nFastModRed(gf2nMul(a, b), t, fr, lr, f);
}

gf2nModSq = function(a, t, fr, lr, f) {
  // Modular squaring over GF(2^n)
  return gf2nFastModRed(gf2nSq(a), t, fr, lr, f);
}

gf2nModSqrt = function(a, t, fr, lr, sc, f) {
  // Modular squaring over GF(2^n)
  return gf2nFastModRed(gf2nSqrt(a, sc), t, fr, lr, f);
}

gf2nModInv = function(a, f) {
  if (a.length == 0 || f.length == 0) {
    return [];
  }
  var u = a.slice(0);
  var v = f.slice(0);
  var g1 = [1];
  var g2 = [];

  while (!((u.length == 1 && u[0] == 1) || (v.length == 1 && v[0] == 1))) {
    while ((u[0] & 1) == 0) {
      shiftRightwithinBaseBitLength(u, 1);
      if ((g1[0] & 1) != 0) {
        g1 = gf2nAdd(g1, f);
      }
      shiftRightwithinBaseBitLength(g1, 1);
    }

    while ((v[0] & 1) == 0) {
      shiftRightwithinBaseBitLength(v, 1);
      if ((g2[0] & 1) != 0) {
        g2 = gf2nAdd(g2, f);
      }
      shiftRightwithinBaseBitLength(g2, 1);
    }

    if (strictGreaterThan(u, v)) {
      u = gf2nAdd(u, v);
      g1 = gf2nAdd(g1, g2);
    } else {
      v = gf2nAdd(u, v);
      g2 = gf2nAdd(g1, g2);
    }
  }

  if (u.length == 1 && u[0] == 1) {
    return g1;
  } else {
    return g2;
  }
}

binaryCurve_K283 = {
  t: 283,
  fr: function (u) {
    var v1 = u.slice(0);
    var v2 = u.slice(0);
    var v3 = u.slice(0);
    shiftLeftwithinBaseBitLength(v1, 5);
    shiftLeftwithinBaseBitLength(v2, 7);
    shiftLeftwithinBaseBitLength(v3, 12);
    var v = gf2nAdd(v1, u);
    v = gf2nAdd(v2, v);
    v = gf2nAdd(v3, v);
    return v;
  },
  lr: function (u) {
    var v1 = u[11];
    var v2 = u[11];
    var v3 = u[11];
    var v4 = u[11];
    shiftRightwithinBaseBitLength(v1, 27);
    shiftRightwithinBaseBitLength(v2, 22);
    shiftRightwithinBaseBitLength(v3, 20);
    shiftRightwithinBaseBitLength(v4, 15);
    var v = gf2nAdd(v1, u);
    v = gf2nAdd(v2, v);
    v = gf2nAdd(v3, v);
    v = gf2nAdd(v4, v);
    v[11] &= 0x7ffff;
    return v;
  },
  sc: [3,11,16,17,22,23,28,29,34,35,40,41,46,47,52,53,58,59,64,65,70,71,76,77,82,83,88,89,94,95,100,101,106,107,
    112,118,113,119,124,125,130,131,136,137,143,149,155,161,167,173,179,185,191,197,203,209,215,221,227,233,
    239,245,251,257,263,269,275,281],
  a: 0,
  f: [0x10a1,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x80000],
  n: [0x163c61,0x1e061e,0x7f9445,0x265dff,0xd07577,0xe9ae2e,0xffffff,0xffffff,0xffffff,0xffffff,0xffffff,0x1ffff],
  mu: [0xe7fe45,0x787a70,0xeeb87e,0x80201a,0xa23668,0x744be2,0x594,0x0,0x0,0x0,0x0,0x0,0x80],
  G: {
    x: [0x492836,0xac2458,0x13b0c2,0x168769,0xc1567a,0x265f23,0xe553cd,0x62f188,0x1a3b81,0x44883f,0x3f78ca,0x50321],
    y: [0xdd2259,0x116177,0x364e34,0xe45962,0x184698,0x45c0e8,0x6fe87e,0x7e542,0x90f95d,0x9e318d,0x380f1c,0x1ccda],
    z: [1]
  },
  G3: {
    x: [0x4fe3b5,0xe28012,0x6c5912,0x391ad3,0xaac521,0x321408,0x741090,0xfec337,0x412d51,0x1f5146,0xc30a8b,0x15dcc],
    y: [0x79f192,0xd5b4d2,0x13d979,0x898e92,0xbafe28,0x21635f,0x7ac1b4,0xa98c4c,0xad97f6,0x312952,0xbed137,0x53fc9],
    z: [1]
  },
  G5: {
    x: [0xa2b90d,0xe8f524,0x199ec2,0x922348,0x2ff0ab,0xad17d0,0x85022b,0xcfc15e,0x42683a,0x1a1a0f,0x57c3bd,0x7879d],
    y: [0x2d7df8,0x691abd,0xacb848,0xb9f1b0,0xe749ae,0x87e22e,0xb4fc24,0x5653fb,0x205fc9,0x9fb467,0x63076,0x74595],
    z: [1]
  },
  G7: {
    x: [0x1474be,0xdd4d64,0x2b4c72,0x89b5eb,0xedf4c1,0x35b215,0xeb5385,0x4dfee6,0x4b035b,0xd17e2a,0xc84be2,0x16316],
    y: [0xa1096a,0xefd51f,0xf81c,0xb177f0,0x1488b2,0xa8f6a8,0x28a3fa,0x855b40,0x32928f,0x6b8a8f,0x23fe3b,0x2119b],
    z: [1]
  },
  G9: {
    x: [0x2ff4a2,0x58d78d,0x4cbc41,0x72ac4c,0x142a12,0xe33a42,0x6d96d0,0x831545,0xf55e38,0x15821e,0x3a736c,0x18c2e],
    y: [0xf48398,0xee2836,0xd7afc9,0x2b8d14,0x6930e,0xbec3dc,0xf66f7b,0x1b68b4,0x82cd16,0xf0b5a6,0x758d00,0x3131b],
    z: [1]
  },
  G11: {
    x: [0x203b03,0xc1f398,0x2a5f1a,0x6749cc,0xc0941,0x18469f,0x2d1227,0x7d5b08,0x7cb0da,0xd85567,0x19d923,0x4c8ab],
    y: [0xa9f8f2,0x44b65,0x7883b9,0xa81059,0xdc5bfa,0x1c7aee,0x8d2d2b,0x52569f,0xed15b4,0xe2d102,0x8dad4d,0x79e75],
    z: [1]
  },
  G13: {
    x: [0xbb8bf,0x2bd111,0xe563c,0xb6a432,0x939333,0xd5a1c0,0x2266e8,0x95130f,0x34adf6,0xeb27a0,0xa51c7c,0x532ad],
    y: [0x37bc32,0x48105f,0x35bcd0,0x85955c,0xdca0b,0x57880,0x87b3c4,0x549832,0xf3ce07,0x2bb943,0xdb963d,0x1a4ad],
    z: [1]
  },
  G15: {
    x: [0x99fde1,0x4e613d,0x46dcd8,0x74b9c3,0x45b0,0x53c310,0x3b29a,0x36c5a,0x33a7d4,0xb4eaf6,0x5d234d,0x58eee],
    y: [0x48fcc7,0x986d59,0xb5dddb,0x8eee00,0x4ecea9,0xc14118,0x4ab17c,0x95611d,0x940afa,0x1831e3,0x71f5a9,0x48d39],
    z: [1]
  }
}

ldProjectToAffine = function(P, curve) {
  if (P.z.length == 0) {
    return {x: [1], y: [1], z: []};
  }
  if(P.z.length == 1 && P.z[0] == 1) {
    return P;
  }
  var zi = gf2nModInv(P.z, curve.f);
  var x = gf2nModMul(P.x, zi, curve.t, curve.fr, curve.lr, curve.f);
  var zis = gf2nModSq(zi, curve.t, curve.fr, curve.lr, curve.f);
  var y = gf2nModMul(P.y, zis, curve.t, curve.fr, curve.lr, curve.f);

  return {x: x, y: y, z: [1]};
}

affineToLambda = function(P, curve) {
  if (!(P.z.length == 1 && P.z[0] == 1)) {
    throw new Error(" P is not represented by affine coordinates in affineToLambda! ");
  }
  if (P.z.length == 0) {
    return {x: [1], y: [1], z: []};
  }
  var xinv = gf2nModInv(P.x, curve.f);
  var ydivx = gf2nModMul(xinv, P.y, curve.t, curve.fr, curve.lr, curve.f);
  var lambda = gf2nAdd(P.x, ydivx);

  return {x: P.x, y: lambda, z: [1]};
}

lambdaToAffine = function(Pl, curve) {
  if (!(Pl.z.length == 1 && Pl.z[0] == 1)) {
    throw new Error(" Pl is not represented by affine coordinates in lambdaToAffine! ");
  }
  if (Pl.z.length == 0) {
    return {x: [1], y: [1], z: []};
  }
  var x1 = gf2nModMul(Pl.x, Pl.y, curve.t, curve.fr, curve.lr, curve.f);
  var x2 = gf2nModSq(Pl.x, curve.t, curve.fr, curve.lr, curve.f);
  var y  = gf2nModAdd(x1, x2, curve.f);

  return {x: Pl.x, y: y, z: [1]};
}

pointNegation = function(P, curve) {
  if (!(P.z.length == 1 && P.z[0] == 1)) {
    throw new Error(" P is not represented by affine coordinates in pointNegation! ");
  }
  if (P.z.length == 0) {
    return {x: [1], y: [1], z: []};
  }
  var yn = gf2nModAdd(P.x, P.y, curve.f);

  return {x: P.x, y: yn, z: [1]};
}

pointMixedAddition = function(P, Q, curve) {
  if (!(Q.z.length == 1 && Q.z[0] == 1)) {
    throw new Error(" Q is not represented by affine coordinates in pointMixedAddition! ");
  }
  var t1, t2, t3;
  var x3, y3, z3;
  if (P.z.length == 0) {
    return Q;
  }
  if (Q.z.length == 0) {
    return P;
  }
  t1 = gf2nModMul(P.z, Q.x, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModSq(P.z, curve.t, curve.fr, curve.lr, curve.f);
  x3 = gf2nModAdd(P.x, t1, curve.f);
  t1 = gf2nModMul(P.z, x3, curve.t, curve.fr, curve.lr, curve.f);
  t3 = gf2nModMul(Q.y, t2, curve.t, curve.fr, curve.lr, curve.f);
  y3 = gf2nModAdd(P.y, t3, curve.f);
  if (x3.length == 1 && x3[0] == 0) {
    if (y3.length == 1 && y3[0] == 0) {
      return pointDoubling(Q, curve);
    } else {
      return {x: [1], y: [1], z: []};
    }
  }
  z3 = gf2nModSq(t1, curve.t, curve.fr, curve.lr, curve.f);
  t3 = gf2nModMul(t1, y3, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModSq(x3, curve.t, curve.fr, curve.lr, curve.f);
  x3 = gf2nModMul(t1, t2, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModSq(y3, curve.t, curve.fr, curve.lr, curve.f);
  x3 = gf2nModAdd(x3, t2, curve.f);
  x3 = gf2nModAdd(x3, t3, curve.f);
  t2 = gf2nModMul(Q.x, z3, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModAdd(x3, t2, curve.f);
  t1 = gf2nModSq(z3, curve.t, curve.fr, curve.lr, curve.f);
  t3 = gf2nModAdd(z3, t3, curve.f);
  y3 = gf2nModMul(t2, t3, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModAdd(Q.x, Q.y, curve.f);
  t3 = gf2nModMul(t1, t2, curve.t, curve.fr, curve.lr, curve.f);
  y3 = gf2nModAdd(y3, t3, curve.f);

  return {x: x3, y: y3, z: z3};
}

pointDoubling = function(P, curve) {
  if (P.z.length == 0) {
    return {x: [1], y: [1], z: []};
  }
  var t1, t2;
  var x2, y2, z2;
  t1 = gf2nModSq(P.z, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModSq(P.x, curve.t, curve.fr, curve.lr, curve.f);
  z2 = gf2nModMul(t1, t2, curve.t, curve.fr, curve.lr, curve.f);
  x2 = gf2nModSq(t2, curve.t, curve.fr, curve.lr, curve.f);
  t1 = gf2nModSq(t1, curve.t, curve.fr, curve.lr, curve.f);
  x2 = gf2nModAdd(x2, t1, curve.f);
  t2 = gf2nModSq(P.y, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModAdd(t1, t2, curve.f);
  y2 = gf2nModMul(x2, t2, curve.t, curve.fr, curve.lr, curve.f);
  t2 = gf2nModMul(t1, z2, curve.t, curve.fr, curve.lr, curve.f);
  y2 = gf2nModAdd(y2, t2, curve.f);

  return {x: x2, y: y2, z: z2};
}

NAF5_Expansion = function(k) {
  var u = k.slice(0);
  var v = [0];
  var w = [];
  var i = 0;
  while (!(u.length == 0)) {
    if(u[0] & 1 != 0) {
      v[0] = u[0] & 0x1f;
      if (v[0] < 16) {
        w[i] = v[0];
        u = bigIntSub(u, v);
      } else {
        w[i] = v[0] - 32;
        v[0] = 32 - v[0];
        u = bigIntAdd(u, v);
      }
    } else {
      w[i] = 0;
    }
    shiftRightwithinBaseBitLength(u, 1);
    i++;
  }
  return w;
}

NAF5_Fixed_ScalarMul = function(k, curve) {
  if (k.length == 0) {
    return {x: [1], y: [1], z: []};
  }
  var a = NAF5_Expansion(k);
  var R = {x: [1], y: [1], z: []};
  var T;
  for(var i = a.length; i != 0; i--) {
    R = pointDoubling(R, curve);
    switch(a[i - 1]) {
      case 0:   break;
      case 1:   R = pointMixedAddition(R, curve.G, curve);
        break;
      case -1:  T = pointNegation(curve.G, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 3:   R = pointMixedAddition(R, curve.G3, curve);
        break;
      case -3:  T = pointNegation(curve.G3, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 5:   R = pointMixedAddition(R, curve.G5, curve);
        break;
      case -5:  T = pointNegation(curve.G5, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 7:   R = pointMixedAddition(R, curve.G7, curve);
        break;
      case -7:  T = pointNegation(curve.G7, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 9:   R = pointMixedAddition(R, curve.G9, curve);
        break;
      case -9:  T = pointNegation(curve.G9, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 11:  R = pointMixedAddition(R, curve.G11, curve);
        break;
      case -11: T = pointNegation(curve.G11, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 13:  R = pointMixedAddition(R, curve.G13, curve);
        break;
      case -13: T = pointNegation(curve.G13, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 15:  R = pointMixedAddition(R, curve.G15, curve);
        break;
      case -15: T = pointNegation(curve.G15, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      default:
        throw new Error("NAF5 expansion is not correct!");
    }
  }
  return ldProjectToAffine(R, curve);
}

NAF5_Random_ScalarMul = function(k, P, curve) {
  if (k.length == 0) {
    return {x: [1], y: [1], z: []};
  }
  // Precomputation
  var P3, P5, P7, P9, P11, P13, P15;
  var S, T;
  S  = pointDoubling(P, curve);
  T  = pointMixedAddition(S, P, curve);
  P3 = ldProjectToAffine(T, curve);
  T  = pointMixedAddition(S, P3, curve);
  P5 = ldProjectToAffine(T, curve);
  T  = pointMixedAddition(S, P5, curve);
  P7 = ldProjectToAffine(T, curve);
  T  = pointMixedAddition(S, P7, curve);
  P9 = ldProjectToAffine(T, curve);
  T  = pointMixedAddition(S, P9, curve);
  P11 = ldProjectToAffine(T, curve);
  T  = pointMixedAddition(S, P11, curve);
  P13 = ldProjectToAffine(T, curve);
  T  = pointMixedAddition(S, P13, curve);
  P15 = ldProjectToAffine(T, curve);

  var a = NAF5_Expansion(k);
  var R = {x: [1], y: [1], z: []};
  for(var i = a.length; i != 0; i--) {
    R = pointDoubling(R, curve);
    switch(a[i - 1]) {
      case 0:   break;
      case 1:   R = pointMixedAddition(R, P, curve);
        break;
      case -1:  T = pointNegation(P, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 3:   R = pointMixedAddition(R, P3, curve);
        break;
      case -3:  T = pointNegation(P3, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 5:   R = pointMixedAddition(R, P5, curve);
        break;
      case -5:  T = pointNegation(P5, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 7:   R = pointMixedAddition(R, P7, curve);
        break;
      case -7:  T = pointNegation(P7, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 9:   R = pointMixedAddition(R, P9, curve);
        break;
      case -9:  T = pointNegation(P9, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 11:  R = pointMixedAddition(R, P11, curve);
        break;
      case -11: T = pointNegation(P11, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 13:  R = pointMixedAddition(R, P13, curve);
        break;
      case -13: T = pointNegation(P13, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      case 15:  R = pointMixedAddition(R, P15, curve);
        break;
      case -15: T = pointNegation(P15, curve);
        R = pointMixedAddition(R, T, curve);
        break;
      default:
        throw new Error("NAF5 expansion is not correct!");
    }
  }
  return ldProjectToAffine(R, curve);
}

curveSecurity = function(curve) {
  if (curve.t === 283) {
    return 128;
  }
  return 0;
}

ecKeyPairGeneration = function(rbgStateStorage, curve) {
  if (curveSecurity(curve) > 128) {
    throw new Error(" RBG security strength is not enough for curve! ");
  }
  var nLen = bitLengthOfBigInt(curve.n);
  var bitArray = hashBasedRBG(rbgStateStorage, curveSecurity(curve), nLen);
  var d = bitArraytoBigInt(bitArray);
  var Q = ldProjectToAffine(NAF5_Fixed_ScalarMul(d, curve), curve);
  var Ql = affineToLambda(Q, curve);
  return {d: d, Q: Ql};
}

ecPublicKeyValidation = function(Ql, curve) {
  if (!(Ql.z.length == 1 && Ql.z[0] == 1)) {
    throw new Error(" Ql is not represented by affine coordinates in ecPublicKeyValidation! ");
  }
  if (Ql.z.length == 0) {
    return false;
  }
  var Qa = lambdaToAffine(Ql, curve);
  var lx = bitLengthOfBigInt(Qa.x);
  var ly = bitLengthOfBigInt(Qa.y);
  if (!(strictGreaterThan(Qa.x, []) && lx <= curve.t)) {
    return false;
  }
  if (!(strictGreaterThan(Qa.y, []) && ly <= curve.t)) {
    return false;
  }
  var s = gf2nModSq(Qa.x, curve.t, curve.fr, curve.lr, curve.f);
  var r = gf2nModMul(Qa.x, s, curve.t, curve.fr, curve.lr, curve.f);
  r[0] ^= 0x1;
  if (curve.a == 1) {
    r = gf2nModAdd(r, s, curve.f);
  }
  var t = gf2nModSq(Qa.y, curve.t, curve.fr, curve.lr, curve.f);
  var l = gf2nModMul(Qa.x, Qa.y, curve.t, curve.fr, curve.lr, curve.f);
  l = gf2nModAdd(l, t, curve.f);
  if (!equal(r, l)) {
    return false;
  }
  var R = pointDoubling(Qa, curve);
  if (curve.a == 0) {
    R = pointDoubling(R, curve);
  }
  Ra = ldProjectToAffine(R, curve);
  if (Ra.z.length == 0) {
    return false;
  }
  return true;
}

ECDSASignHashK = function(curve, d, h, k, kInv) {
  var n = curve.n;
  var Ra = NAF5_Fixed_ScalarMul(k, curve);
  var r = Ra.x;
  while (greaterThanOrEqual(r, n)) {
    r = bigIntSub(r, n);
  }
  if (r.length == 0) {
    return;
  }
  var nLen = bitLengthOfBigInt(n);
  if (nLen < h.length){
    h = h.concat();
    h.length = nLen;
  }
  var hc = bitArrayReordering(h);
  var e = bitArraytoBigInt(hc);
  var mu = binaryCurve_K283.mu;
  var u = gfpModMul(d, r, n, mu);
  var v = gfpModAdd(e, u, n);
  var s = gfpModMul(kInv, v, n, mu);
  if (s.length == 0) {
    return;
  }
  return {r:r, s:s};
}

ECDSASignHash = function(rbgStateStorage, curve, d, h) {
  if (curveSecurity(curve) > 128) {
    throw new Error(" RBG security strength is not enough for curve! ");
  }
  while (true) {
    var nLen = bitLengthOfBigInt(curve.n);
    var bitArray = hashBasedRBG(rbgStateStorage, curveSecurity(curve), nLen);
    var k = bitArraytoBigInt(bitArray);
    var kInv = gfpModInv(k, curve.n);
    var o = ECDSASignHashK(curve, d, h, k, kInv);
    if (o !== undefined) {
      return o;
    }
  }
}

ECDSASignMsg = function(rbgStateStorage, curve, d, msg) {
  if (curveSecurity(curve) == 128) {
    return ECDSASignHash(rbgStateStorage, curve, d, blake256Hash(msg));
  }
  throw new Error(" No hash function of adequate security strength is available! ");
}

ECDSAVerifyHash = function(curve, Ql, h, sig) {
  if (!(Ql.z.length == 1 && Ql.z[0] == 1)) {
    throw new Error(" Ql is not represented by affine coordinates in ECDSAVerifyHash! ");
  }
  if (!ecPublicKeyValidation(Ql, curve)) {
    return false;
  }
  var n = curve.n;
  if (!(strictGreaterThan(sig.r, []) && strictGreaterThan(n, sig.r) && strictGreaterThan(sig.s, []) && strictGreaterThan(n, sig.s))) {
    return false;
  }
  var nLen = bitLengthOfBigInt(n);
  if (nLen < h.length){
    h = h.concat();
    h.length = nLen;
  }
  var hc = bitArrayReordering(h);
  var e = bitArraytoBigInt(hc);
  var w = gfpModInv(sig.s, n);
  var mu = binaryCurve_K283.mu;
  var u1 = gfpModMul(e, w, n, mu);
  var u2 = gfpModMul(sig.r, w, n, mu);
  var Q = lambdaToAffine(Ql, curve);
  var R1 = NAF5_Fixed_ScalarMul(u1, curve);
  var R2 = NAF5_Random_ScalarMul(u2, Q, curve);
  var Rp = pointMixedAddition(R1, R2, curve);
  var Ra = ldProjectToAffine(Rp, curve);
  var v = Ra.x;
  while (greaterThanOrEqual(v, n)) {
    v = bigIntSub(v, n);
  }
  if (equal(v, sig.r)) {
    return true;
  }
  else {
    return false;
  }
}

ECDSAVerifyMsg = function(curve, Ql, msg, sig) {
  if (curveSecurity(curve) == 128) {
    return ECDSAVerifyHash(curve, Ql, blake256Hash(msg), sig);
  }
  throw new Error(" No hash function of adequate security strength is available! ");
}
