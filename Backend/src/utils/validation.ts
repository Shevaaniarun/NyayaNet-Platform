import { Request, Response, NextFunction } from 'express';

interface ValidationRule {
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
  pattern?: RegExp;
  default?: any;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];
    const data = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const isRequired = rules.required !== false;

      // Check required fields
      if (isRequired && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `${field} is required`
        });
        continue;
      }

      // Skip further validation if value is not provided and not required
      if (!isRequired && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push({
          field,
          message: `${field} must be a string`
        });
      } else if (rules.type === 'number' && typeof value !== 'number') {
        errors.push({
          field,
          message: `${field} must be a number`
        });
      } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push({
          field,
          message: `${field} must be a boolean`
        });
      } else if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push({
          field,
          message: `${field} must be an array`
        });
      }

      // String validations
      if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.minLength} characters`
          });
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({
            field,
            message: `${field} must be at most ${rules.maxLength} characters`
          });
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({
            field,
            message: `${field} has invalid format`
          });
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({
            field,
            message: `${field} must be one of: ${rules.enum.join(', ')}`
          });
        }
      }

      // Number validations
      if (rules.type === 'number') {
        if (rules.min && value < rules.min) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.min}`
          });
        }

        if (rules.max && value > rules.max) {
          errors.push({
            field,
            message: `${field} must be at most ${rules.max}`
          });
        }
      }

      // Array validations
      if (rules.type === 'array') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({
            field,
            message: `${field} must have at least ${rules.minLength} items`
          });
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({
            field,
            message: `${field} must have at most ${rules.maxLength} items`
          });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

export const validationResult = (req: Request) => {
  return {
    isEmpty: () => true, // Simplified - you can implement proper validation
    array: () => []
  };
};