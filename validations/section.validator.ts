import { body, param } from 'express-validator';

import { validate } from '../middlewares/validation.middleware';

export const getSectionByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Section id is required',
      ar: 'معرف القسم مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Section id is not valid',
      ar: 'معرف القسم غير صالح',
    }),
  validate,
];

export const createSectionValidator = [
  //#region  Type of section
  body('type')
    .notEmpty()
    .isIn([
      'slider',
      'banner',
      'aboutus',
      'privacy',
      'usage',
      'retrieval',
      'public',
    ])
    .withMessage({ en: 'Type is required', ar: 'النوع مطلوب' }),
  //#endregion Type of section

  // #region  Alignment of section
  body('alignment')
    .if(body('type').equals('banner'))
    .notEmpty()
    .isIn(['horizontal', 'vertical'])
    .withMessage({
      en: 'Alignment must be horizontal or vertical',
      ar: 'يجب أن يكون الانحياز أفقيًا أو عموديًا',
    }),
  // #endregion Alignment of section

  //#region  Title of section
  body('title_en')
    .if(
      body('type').custom((value) =>
        ['aboutus', 'privacy', 'usage', 'retrieval', 'public'].includes(value),
      ),
    )
    .notEmpty()
    .withMessage({
      en: 'title_en must not be empty',
      ar: 'العنوان باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'title_en must be a string',
      ar: 'العنوان باللغة الإنجليزية يجب أن يكون سلسلة',
    }),

  body('title_en')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'title_en must be a string',
      ar: 'العنوان باللغة الإنجليزية يجب أن يكون سلسلة',
    }),
  body('title_ar')
    .if(
      body('type').equals(
        'aboutus' || 'privacy' || 'usage' || 'retrieval' || 'public',
      ),
    )
    .notEmpty()
    .withMessage({
      en: 'title_ar is required',
      ar: 'العنوان باللغة العربية مطلوب',
    })
    .isString()
    .withMessage('Title must be string'),
  body('title_ar')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'title_ar must be string',
      ar: 'العنوان باللغة العربية يجب أن يكون سلسلة',
    }),
  //#endregion Title of section

  //#region  Description of section
  body('description_en')
    .if(
      body('type').equals(
        'aboutus' || 'privacy' || 'usage' || 'retrieval' || 'public',
      ),
    )
    .notEmpty()
    .withMessage({
      en: 'description_en is required',
      ar: 'الوصف باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'description_en must be string',
      ar: 'الوصف باللغة الإنجليزية يجب أن يكون سلسلة',
    }),
  body('description_en')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'description_en must be string',
      ar: 'الوصف باللغة الإنجليزية يجب أن يكون سلسلة',
    }),
  body('description_ar')
    .if(
      body('type').equals(
        'aboutus' || 'privacy' || 'usage' || 'retrieval' || 'public',
      ),
    )
    .notEmpty()
    .withMessage({
      en: 'description_ar is required',
      ar: 'الوصف باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'description_ar must be string',
      ar: 'الوصف باللغة العربية يجب أن يكون سلسلة',
    }),
  body('description_ar')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'description_ar must be string',
      ar: 'الوصف باللغة العربية يجب أن يكون سلسلة',
    }),
  //#endregion Description of section

  //#region  Image of section
  body('image')
    .if(
      body('type').custom((value) =>
        ['slider', 'aboutus', 'banner'].includes(value),
      ),
    )
    .notEmpty()
    .withMessage({ en: 'Image is required', ar: 'الصورة مطلوبة' })
    .isString()
    .withMessage({
      en: 'Image must be string',
      ar: 'الصورة يجب أن تكون سلسلة',
    }),
  //#endregion Image of section

  //#region  Title and Desc Meta of section
  body('title_meta').optional().isString().withMessage({
    en: 'title_meta must be string',
    ar: 'عنوان الوصف يجب أن يكون سلسلة',
  }),
  body('desc_meta').optional().isString().withMessage({
    en: 'Desc_meta must be string',
    ar: 'وصف الوصف يجب أن يكون سلسلة',
  }),
  //#endregion Title and Desc Meta of section
  validate,
];

export const updateSectionValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Section id is required',
      ar: 'معرف القسم مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Section id is not valid',
      ar: 'معرف القسم غير صالح',
    }),
  //#region  Type of section
  body('type')
    .optional()
    .notEmpty()
    .isIn([
      'slider',
      'banner',
      'aboutus',
      'privacy',
      'usage',
      'retrieval',
      'public',
    ])
    .withMessage({ en: 'Type is required', ar: 'النوع مطلوب' }),
  //#endregion Type of section

  // #region  Alignment of section
  body('alignment')
    .if(body('type').equals('banner'))
    .optional()
    .notEmpty()
    .isIn(['horizontal', 'vertical'])
    .withMessage({
      en: 'Alignment must be horizontal or vertical',
      ar: 'يجب أن يكون الانحياز أفقيًا أو عموديًا',
    }),
  // #endregion Alignment of section

  //#region  Title of section
  body('title_en')
    .if(
      body('type').custom((value) =>
        ['aboutus', 'privacy', 'usage', 'retrieval', 'public'].includes(value),
      ),
    )
    .optional()
    .notEmpty()
    .withMessage({
      en: 'title_en must not be empty',
      ar: 'العنوان باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'title_en must be a string',
      ar: 'العنوان باللغة الإنجليزية يجب أن يكون سلسلة',
    }),

  body('title_en')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'title_en must be a string',
      ar: 'العنوان باللغة الإنجليزية يجب أن يكون سلسلة',
    }),
  body('title_ar')
    .if(
      body('type').equals(
        'aboutus' || 'privacy' || 'usage' || 'retrieval' || 'public',
      ),
    )
    .optional()
    .notEmpty()
    .withMessage({
      en: 'title_ar is required',
      ar: 'العنوان باللغة العربية مطلوب',
    })
    .isString()
    .withMessage('Title must be string'),
  body('title_ar')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'title_ar must be string',
      ar: 'العنوان باللغة العربية يجب أن يكون سلسلة',
    }),
  //#endregion Title of section

  //#region  Description of section
  body('description_en')
    .if(
      body('type').equals(
        'aboutus' || 'privacy' || 'usage' || 'retrieval' || 'public',
      ),
    )
    .optional()
    .notEmpty()
    .withMessage({
      en: 'description_en is required',
      ar: 'الوصف باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'description_en must be string',
      ar: 'الوصف باللغة الإنجليزية يجب أن يكون سلسلة',
    }),
  body('description_en')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'description_en must be string',
      ar: 'الوصف باللغة الإنجليزية يجب أن يكون سلسلة',
    }),
  body('description_ar')
    .if(
      body('type').equals(
        'aboutus' || 'privacy' || 'usage' || 'retrieval' || 'public',
      ),
    )
    .optional()
    .notEmpty()
    .withMessage({
      en: 'description_ar is required',
      ar: 'الوصف باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'description_ar must be string',
      ar: 'الوصف باللغة العربية يجب أن يكون سلسلة',
    }),
  body('description_ar')
    .if(body('type').equals('slider'))
    .optional()
    .isString()
    .withMessage({
      en: 'description_ar must be string',
      ar: 'الوصف باللغة العربية يجب أن يكون سلسلة',
    }),
  //#endregion Description of section

  //#region  Image of section
  body('image')
    .if(
      body('type').custom((value) =>
        ['slider', 'aboutus', 'banner'].includes(value),
      ),
    )
    .optional()
    .notEmpty()
    .withMessage({ en: 'Image is required', ar: 'الصورة مطلوبة' })
    .isString()
    .withMessage({
      en: 'Image must be string',
      ar: 'الصورة يجب أن تكون سلسلة',
    }),
  //#endregion Image of section

  //#region  Title and Desc Meta of section
  body('title_meta').optional().isString().withMessage({
    en: 'title_meta must be string',
    ar: 'عنوان الوصف يجب أن يكون سلسلة',
  }),
  body('desc_meta').optional().isString().withMessage({
    en: 'Desc_meta must be string',
    ar: 'وصف الوصف يجب أن يكون سلسلة',
  }),
  validate,
];

export const deleteSectionValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Section id is required',
      ar: 'معرف القسم مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Section id is not valid',
      ar: 'معرف القسم غير صالح',
    }),
  validate,
];
