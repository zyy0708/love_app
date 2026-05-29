export const registerSchema = {
  body: {
    username: {
      type: 'string',
      min: 3,
      max: 30,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      min: 8
    }
  },
  required: ['username', 'email', 'password']
};

export const loginSchema = {
  body: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string'
    }
  },
  required: ['email', 'password']
};

export const diaryEntrySchema = {
  body: {
    title: {
      type: 'string',
      max: 255,
      optional: true
    },
    content: {
      type: 'string',
      min: 1
    },
    mood: {
      type: 'string',
      enum: ['happy', 'sad', 'angry', 'neutral', 'loved', 'excited'],
      optional: true
    },
    images: {
      type: 'array',
      items: {
        type: 'string'
      },
      optional: true
    }
  },
  required: ['content']
};

export const bindCoupleSchema = {
  body: {
    bindCode: {
      type: 'string',
      min: 6,
      max: 6
    }
  },
  required: ['bindCode']
};

export const initializeCoupleSchema = {
  body: {
    user2Email: {
      type: 'string',
      format: 'email'
    }
  },
  required: ['user2Email']
};

export function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    
    if (schema.body) {
      const body = req.body;
      
      if (schema.required) {
        for (const field of schema.required) {
          if (!body[field]) {
            errors.push(`${field} is required`);
          }
        }
      }
      
      if (body.username !== undefined) {
        if (typeof body.username !== 'string') {
          errors.push('username must be a string');
        } else {
          if (body.username.length < 3 || body.username.length > 30) {
            errors.push('username must be between 3 and 30 characters');
          }
          if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
            errors.push('username can only contain letters, numbers, and underscores');
          }
        }
      }
      
      if (body.email !== undefined) {
        if (typeof body.email !== 'string') {
          errors.push('email must be a string');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(body.email)) {
            errors.push('invalid email format');
          }
        }
      }
      
      if (body.password !== undefined) {
        if (typeof body.password !== 'string') {
          errors.push('password must be a string');
        } else if (body.password.length < 8) {
          errors.push('password must be at least 8 characters');
        }
      }
      
      if (body.title !== undefined && body.title !== null) {
        if (typeof body.title !== 'string') {
          errors.push('title must be a string');
        } else if (body.title.length > 255) {
          errors.push('title must not exceed 255 characters');
        }
      }
      
      if (body.mood !== undefined && body.mood !== null) {
        const validMoods = ['happy', 'sad', 'angry', 'neutral', 'loved', 'excited'];
        if (!validMoods.includes(body.mood)) {
          errors.push(`mood must be one of: ${validMoods.join(', ')}`);
        }
      }
      
      if (body.bindCode !== undefined) {
        if (typeof body.bindCode !== 'string' || body.bindCode.length !== 6) {
          errors.push('bindCode must be 6 characters');
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
}
