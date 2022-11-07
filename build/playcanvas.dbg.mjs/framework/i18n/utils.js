/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { DEFAULT_LOCALE, DEFAULT_LOCALE_FALLBACKS } from './constants.js';

const PLURALS = {};

function definePluralFn(locales, fn) {
  for (let i = 0, len = locales.length; i < len; i++) {
    PLURALS[locales[i]] = fn;
  }
}

function getLang(locale) {
  const idx = locale.indexOf('-');
  if (idx !== -1) {
    return locale.substring(0, idx);
  }
  return locale;
}

function replaceLang(locale, desiredLang) {
  const idx = locale.indexOf('-');
  if (idx !== -1) {
    return desiredLang + locale.substring(idx);
  }
  return desiredLang;
}
function findAvailableLocale(desiredLocale, availableLocales) {
  if (availableLocales[desiredLocale]) {
    return desiredLocale;
  }
  let fallback = DEFAULT_LOCALE_FALLBACKS[desiredLocale];
  if (fallback && availableLocales[fallback]) {
    return fallback;
  }
  const lang = getLang(desiredLocale);
  fallback = DEFAULT_LOCALE_FALLBACKS[lang];
  if (availableLocales[fallback]) {
    return fallback;
  }
  if (availableLocales[lang]) {
    return lang;
  }
  return DEFAULT_LOCALE;
}

definePluralFn(['ja', 'ko', 'th', 'vi', 'zh', 'id'], function (n) {
  return 0;
});

definePluralFn(['fa', 'hi'], function (n) {
  if (n >= 0 && n <= 1) {
    return 0;
  }

  return 1;
});

definePluralFn(['fr', 'pt'], function (n) {
  if (n >= 0 && n < 2) {
    return 0;
  }

  return 1;
});

definePluralFn(['da'], function (n) {
  if (n === 1 || !Number.isInteger(n) && n >= 0 && n <= 1) {
    return 0;
  }

  return 1;
});

definePluralFn(['de', 'en', 'it', 'el', 'es', 'tr', 'fi', 'sv', 'nb', 'no', 'ur'], function (n) {
  if (n === 1) {
    return 0;
  }

  return 1;
});

definePluralFn(['ru', 'uk'], function (n) {
  if (Number.isInteger(n)) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return 0;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 1;
    } else if (mod10 === 0 || mod10 >= 5 && mod10 <= 9 || mod100 >= 11 && mod100 <= 14) {
      return 2;
    }
  }

  return 3;
});

definePluralFn(['pl'], function (n) {
  if (Number.isInteger(n)) {
    if (n === 1) {
      return 0;
    }

    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 1;
    } else if (mod10 >= 0 && mod10 <= 1 || mod10 >= 5 && mod10 <= 9 || mod100 >= 12 && mod100 <= 14) {
      return 2;
    }
  }

  return 3;
});

definePluralFn(['ar'], function (n) {
  if (n === 0) {
    return 0;
  } else if (n === 1) {
    return 1;
  } else if (n === 2) {
    return 2;
  }

  if (Number.isInteger(n)) {
    const mod100 = n % 100;
    if (mod100 >= 3 && mod100 <= 10) {
      return 3;
    } else if (mod100 >= 11 && mod100 <= 99) {
      return 4;
    }
  }

  return 5;
});

const DEFAULT_PLURAL_FN = PLURALS[getLang(DEFAULT_LOCALE)];

function getPluralFn(lang) {
  return PLURALS[lang] || DEFAULT_PLURAL_FN;
}

export { findAvailableLocale, getLang, getPluralFn, replaceLang };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvaTE4bi91dGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIERFRkFVTFRfTE9DQUxFLFxuICAgIERFRkFVTFRfTE9DQUxFX0ZBTExCQUNLU1xufSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5cbi8vIE1hcHMgbG9jYWxlIHRvIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgcGx1cmFsIGluZGV4XG4vLyBiYXNlZCBvbiB0aGUgQ0xEUiBydWxlcy4gU2VlIGhlcmUgZm9yIHJlZmVyZW5jZVxuLy8gaHR0cHM6Ly93d3cudW5pY29kZS5vcmcvY2xkci9jaGFydHMvbGF0ZXN0L3N1cHBsZW1lbnRhbC9sYW5ndWFnZV9wbHVyYWxfcnVsZXMuaHRtbFxuLy8gYW5kIGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1udW1iZXJzLmh0bWwjT3BlcmFuZHMgLlxuLy8gQW4gaW5pdGlhbCBzZXQgb2YgbG9jYWxlcyBpcyBzdXBwb3J0ZWQgYW5kIHdlIGNhbiBrZWVwIGFkZGluZyBtb3JlIGFzIHdlIGdvLlxuY29uc3QgUExVUkFMUyA9IHt9O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGVmaW5lIHRoZSBwbHVyYWwgZnVuY3Rpb24gZm9yIGFuIGFycmF5IG9mIGxvY2FsZXNcbmZ1bmN0aW9uIGRlZmluZVBsdXJhbEZuKGxvY2FsZXMsIGZuKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGxvY2FsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgUExVUkFMU1tsb2NhbGVzW2ldXSA9IGZuO1xuICAgIH1cbn1cblxuLy8gR2V0cyB0aGUgbGFuZ3VhZ2UgcG9ydGlvbiBmb3JtIGEgbG9jYWxlXG5mdW5jdGlvbiBnZXRMYW5nKGxvY2FsZSkge1xuICAgIGNvbnN0IGlkeCA9IGxvY2FsZS5pbmRleE9mKCctJyk7XG4gICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsZS5zdWJzdHJpbmcoMCwgaWR4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbG9jYWxlO1xufVxuXG4vLyBSZXBsYWNlcyB0aGUgbGFuZ3VhZ2UgaW4gdGhlIHNwZWNpZmllZCBsb2NhbGUgYW5kIHJldHVybnMgdGhlIHJlc3VsdFxuZnVuY3Rpb24gcmVwbGFjZUxhbmcobG9jYWxlLCBkZXNpcmVkTGFuZykge1xuICAgIGNvbnN0IGlkeCA9IGxvY2FsZS5pbmRleE9mKCctJyk7XG4gICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGRlc2lyZWRMYW5nICsgbG9jYWxlLnN1YnN0cmluZyhpZHgpO1xuICAgIH1cblxuICAgIHJldHVybiBkZXNpcmVkTGFuZztcbn1cblxuZnVuY3Rpb24gZmluZEF2YWlsYWJsZUxvY2FsZShkZXNpcmVkTG9jYWxlLCBhdmFpbGFibGVMb2NhbGVzKSB7XG4gICAgaWYgKGF2YWlsYWJsZUxvY2FsZXNbZGVzaXJlZExvY2FsZV0pIHtcbiAgICAgICAgcmV0dXJuIGRlc2lyZWRMb2NhbGU7XG4gICAgfVxuXG4gICAgbGV0IGZhbGxiYWNrID0gREVGQVVMVF9MT0NBTEVfRkFMTEJBQ0tTW2Rlc2lyZWRMb2NhbGVdO1xuICAgIGlmIChmYWxsYmFjayAmJiBhdmFpbGFibGVMb2NhbGVzW2ZhbGxiYWNrXSkge1xuICAgICAgICByZXR1cm4gZmFsbGJhY2s7XG4gICAgfVxuXG4gICAgY29uc3QgbGFuZyA9IGdldExhbmcoZGVzaXJlZExvY2FsZSk7XG5cbiAgICBmYWxsYmFjayA9IERFRkFVTFRfTE9DQUxFX0ZBTExCQUNLU1tsYW5nXTtcbiAgICBpZiAoYXZhaWxhYmxlTG9jYWxlc1tmYWxsYmFja10pIHtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrO1xuICAgIH1cblxuICAgIGlmIChhdmFpbGFibGVMb2NhbGVzW2xhbmddKSB7XG4gICAgICAgIHJldHVybiBsYW5nO1xuICAgIH1cblxuICAgIHJldHVybiBERUZBVUxUX0xPQ0FMRTtcbn1cblxuLy8gT25seSBPVEhFUlxuZGVmaW5lUGx1cmFsRm4oW1xuICAgICdqYScsXG4gICAgJ2tvJyxcbiAgICAndGgnLFxuICAgICd2aScsXG4gICAgJ3poJyxcbiAgICAnaWQnXG5dLCBmdW5jdGlvbiAobikge1xuICAgIHJldHVybiAwO1xufSk7XG5cbi8vIE9ORSwgT1RIRVJcbmRlZmluZVBsdXJhbEZuKFtcbiAgICAnZmEnLFxuICAgICdoaSdcbl0sIGZ1bmN0aW9uIChuKSB7XG4gICAgaWYgKG4gPj0gMCAmJiBuIDw9IDEpIHtcbiAgICAgICAgcmV0dXJuIDA7IC8vIG9uZVxuICAgIH1cblxuICAgIHJldHVybiAxOyAvLyBvdGhlclxufSk7XG5cbi8vIGZyb20gVW5pY29kZSBydWxlczogaSA9IDAuLjFcbmRlZmluZVBsdXJhbEZuKFtcbiAgICAnZnInLFxuICAgICdwdCdcbl0sIGZ1bmN0aW9uIChuKSB7XG4gICAgaWYgKG4gPj0gMCAmJiBuIDwgMikge1xuICAgICAgICByZXR1cm4gMDsgLy8gb25lXG4gICAgfVxuXG4gICAgcmV0dXJuIDE7IC8vIG90aGVyXG59KTtcblxuLy8gZGFuaXNoXG5kZWZpbmVQbHVyYWxGbihbXG4gICAgJ2RhJ1xuXSwgZnVuY3Rpb24gKG4pIHtcbiAgICBpZiAobiA9PT0gMSB8fCAhTnVtYmVyLmlzSW50ZWdlcihuKSAmJiBuID49IDAgJiYgbiA8PSAxKSB7XG4gICAgICAgIHJldHVybiAwOyAvLyBvbmVcbiAgICB9XG5cbiAgICByZXR1cm4gMTsgLy8gb3RoZXJcbn0pO1xuXG5kZWZpbmVQbHVyYWxGbihbXG4gICAgJ2RlJyxcbiAgICAnZW4nLFxuICAgICdpdCcsXG4gICAgJ2VsJyxcbiAgICAnZXMnLFxuICAgICd0cicsXG4gICAgJ2ZpJyxcbiAgICAnc3YnLFxuICAgICduYicsXG4gICAgJ25vJyxcbiAgICAndXInXG5dLCBmdW5jdGlvbiAobikge1xuICAgIGlmIChuID09PSAxKSAge1xuICAgICAgICByZXR1cm4gMDsgLy8gb25lXG4gICAgfVxuXG4gICAgcmV0dXJuIDE7IC8vIG90aGVyXG59KTtcblxuLy8gT05FLCBGRVcsIE1BTlksIE9USEVSXG5kZWZpbmVQbHVyYWxGbihbXG4gICAgJ3J1JyxcbiAgICAndWsnXG5dLCBmdW5jdGlvbiAobikge1xuICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKG4pKSB7XG4gICAgICAgIGNvbnN0IG1vZDEwID0gbiAlIDEwO1xuICAgICAgICBjb25zdCBtb2QxMDAgPSBuICUgMTAwO1xuXG4gICAgICAgIGlmIChtb2QxMCA9PT0gMSAmJiBtb2QxMDAgIT09IDExKSB7XG4gICAgICAgICAgICByZXR1cm4gMDsgLy8gb25lXG4gICAgICAgIH0gZWxzZSBpZiAobW9kMTAgPj0gMiAmJiBtb2QxMCA8PSA0ICYmIChtb2QxMDAgPCAxMiB8fCBtb2QxMDAgPiAxNCkpIHtcbiAgICAgICAgICAgIHJldHVybiAxOyAvLyBmZXdcbiAgICAgICAgfSBlbHNlIGlmIChtb2QxMCA9PT0gMCB8fCBtb2QxMCA+PSA1ICYmIG1vZDEwIDw9IDkgfHwgbW9kMTAwID49IDExICYmIG1vZDEwMCA8PSAxNCkge1xuICAgICAgICAgICAgcmV0dXJuIDI7IC8vIG1hbnlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAzOyAvLyBvdGhlclxufSk7XG5cbi8vIHBvbGlzaFxuZGVmaW5lUGx1cmFsRm4oW1xuICAgICdwbCdcbl0sIGZ1bmN0aW9uIChuKSB7XG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIobikpIHtcbiAgICAgICAgaWYgKG4gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiAwOyAvLyBvbmVcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtb2QxMCA9IG4gJSAxMDtcbiAgICAgICAgY29uc3QgbW9kMTAwID0gbiAlIDEwMDtcblxuICAgICAgICBpZiAobW9kMTAgPj0gMiAmJiBtb2QxMCA8PSA0ICYmIChtb2QxMDAgPCAxMiB8fCBtb2QxMDAgPiAxNCkpIHtcbiAgICAgICAgICAgIHJldHVybiAxOyAvLyBmZXdcbiAgICAgICAgfSBlbHNlIGlmIChtb2QxMCA+PSAwICYmIG1vZDEwIDw9IDEgfHwgbW9kMTAgPj0gNSAmJiBtb2QxMCA8PSA5IHx8IG1vZDEwMCA+PSAxMiAmJiBtb2QxMDAgPD0gMTQpIHtcbiAgICAgICAgICAgIHJldHVybiAyOyAvLyBtYW55XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gMzsgLy8gb3RoZXJcbn0pO1xuXG4vLyBaRVJPLCBPTkUsIFRXTywgRkVXLCBNQU5ZLCBPVEhFUlxuZGVmaW5lUGx1cmFsRm4oW1xuICAgICdhcidcbl0sIGZ1bmN0aW9uIChuKSB7XG4gICAgaWYgKG4gPT09IDApICB7XG4gICAgICAgIHJldHVybiAwOyAvLyB6ZXJvXG4gICAgfSBlbHNlIGlmIChuID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxOyAvLyBvbmVcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIpIHtcbiAgICAgICAgcmV0dXJuIDI7IC8vIHR3b1xuICAgIH1cblxuICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKG4pKSB7XG4gICAgICAgIGNvbnN0IG1vZDEwMCA9IG4gJSAxMDA7XG4gICAgICAgIGlmIChtb2QxMDAgPj0gMyAmJiBtb2QxMDAgPD0gMTApIHtcbiAgICAgICAgICAgIHJldHVybiAzOyAvLyBmZXdcbiAgICAgICAgfSBlbHNlIGlmIChtb2QxMDAgPj0gMTEgJiYgbW9kMTAwIDw9IDk5KSB7XG4gICAgICAgICAgICByZXR1cm4gNDsgLy8gbWFueVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIDU7IC8vIG90aGVyXG59KTtcblxuY29uc3QgREVGQVVMVF9QTFVSQUxfRk4gPSBQTFVSQUxTW2dldExhbmcoREVGQVVMVF9MT0NBTEUpXTtcblxuLy8gR2V0cyB0aGUgZnVuY3Rpb24gdGhhdCBjb252ZXJ0cyB0byBwbHVyYWwgZm9yIGEgbGFuZ3VhZ2VcbmZ1bmN0aW9uIGdldFBsdXJhbEZuKGxhbmcpIHtcbiAgICByZXR1cm4gUExVUkFMU1tsYW5nXSB8fCBERUZBVUxUX1BMVVJBTF9GTjtcbn1cblxuZXhwb3J0IHtcbiAgICByZXBsYWNlTGFuZyxcbiAgICBnZXRMYW5nLFxuICAgIGdldFBsdXJhbEZuLFxuICAgIGZpbmRBdmFpbGFibGVMb2NhbGVcbn07XG4iXSwibmFtZXMiOlsiUExVUkFMUyIsImRlZmluZVBsdXJhbEZuIiwibG9jYWxlcyIsImZuIiwiaSIsImxlbiIsImxlbmd0aCIsImdldExhbmciLCJsb2NhbGUiLCJpZHgiLCJpbmRleE9mIiwic3Vic3RyaW5nIiwicmVwbGFjZUxhbmciLCJkZXNpcmVkTGFuZyIsImZpbmRBdmFpbGFibGVMb2NhbGUiLCJkZXNpcmVkTG9jYWxlIiwiYXZhaWxhYmxlTG9jYWxlcyIsImZhbGxiYWNrIiwiREVGQVVMVF9MT0NBTEVfRkFMTEJBQ0tTIiwibGFuZyIsIkRFRkFVTFRfTE9DQUxFIiwibiIsIk51bWJlciIsImlzSW50ZWdlciIsIm1vZDEwIiwibW9kMTAwIiwiREVGQVVMVF9QTFVSQUxfRk4iLCJnZXRQbHVyYWxGbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVVBLE1BQU1BLE9BQU8sR0FBRyxFQUFFLENBQUE7O0FBR2xCLFNBQVNDLGNBQWMsQ0FBQ0MsT0FBTyxFQUFFQyxFQUFFLEVBQUU7QUFDakMsRUFBQSxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVDLEdBQUcsR0FBR0gsT0FBTyxDQUFDSSxNQUFNLEVBQUVGLENBQUMsR0FBR0MsR0FBRyxFQUFFRCxDQUFDLEVBQUUsRUFBRTtBQUNoREosSUFBQUEsT0FBTyxDQUFDRSxPQUFPLENBQUNFLENBQUMsQ0FBQyxDQUFDLEdBQUdELEVBQUUsQ0FBQTtBQUM1QixHQUFBO0FBQ0osQ0FBQTs7QUFHQSxTQUFTSSxPQUFPLENBQUNDLE1BQU0sRUFBRTtBQUNyQixFQUFBLE1BQU1DLEdBQUcsR0FBR0QsTUFBTSxDQUFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDL0IsRUFBQSxJQUFJRCxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUU7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
