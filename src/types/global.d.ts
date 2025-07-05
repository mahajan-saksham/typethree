// Type definitions for Google Translate API
interface Window {
  google: {
    translate: {
      TranslateElement: {
        new (options: any, element: string): any;
        InlineLayout: {
          SIMPLE: string;
          HORIZONTAL: string;
          VERTICAL: string;
        };
      };
    };
  };
}

// Declaration for googleTranslateElementInit function
declare function googleTranslateElementInit(): void;
