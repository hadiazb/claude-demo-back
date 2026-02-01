/**
 * ============================================================================
 * UNIT TESTS: Welcome Email Template
 * ============================================================================
 *
 * Tests for the welcome email template functions that generate
 * HTML and plain text versions of the registration welcome email.
 */

import {
  getWelcomeEmailHtml,
  getWelcomeEmailText,
  WelcomeEmailData,
} from '@shared/email/infrastructure/templates/welcome.template';

describe('Welcome Email Template', () => {
  const defaultData: WelcomeEmailData = {
    firstName: 'Hugo',
    appName: 'Claude Demo',
    loginUrl: 'https://example.com/login',
  };

  /**
   * =========================================================================
   * SECTION 1: HTML TEMPLATE TESTS
   * =========================================================================
   */
  describe('getWelcomeEmailHtml', () => {
    it('should return a string', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(typeof result).toBe('string');
    });

    it('should include the user first name', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('Hugo');
    });

    it('should include the app name in title', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('Claude Demo');
    });

    it('should include the login URL in the button', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('https://example.com/login');
    });

    it('should include welcome message', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('¡Bienvenido');
    });

    it('should include HTML doctype', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('<!DOCTYPE html>');
    });

    it('should include proper HTML structure', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('<html');
      expect(result).toContain('<head>');
      expect(result).toContain('<body');
      expect(result).toContain('</html>');
    });

    it('should use default loginUrl when not provided', () => {
      const dataWithoutUrl: WelcomeEmailData = {
        firstName: 'Hugo',
        appName: 'Claude Demo',
      };
      const result = getWelcomeEmailHtml(dataWithoutUrl);
      expect(result).toContain('href="#"');
    });

    it('should include copyright notice', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('© 2026');
    });

    it('should handle special characters in firstName', () => {
      const dataWithSpecialChars: WelcomeEmailData = {
        ...defaultData,
        firstName: 'José María',
      };
      const result = getWelcomeEmailHtml(dataWithSpecialChars);
      expect(result).toContain('José María');
    });

    it('should handle special characters in appName', () => {
      const dataWithSpecialChars: WelcomeEmailData = {
        ...defaultData,
        appName: 'App & Co.',
      };
      const result = getWelcomeEmailHtml(dataWithSpecialChars);
      expect(result).toContain('App & Co.');
    });

    it('should include CTA button', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('Iniciar Sesión');
    });

    it('should include meta viewport for mobile', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('viewport');
    });

    it('should include UTF-8 charset', () => {
      const result = getWelcomeEmailHtml(defaultData);
      expect(result).toContain('UTF-8');
    });
  });

  /**
   * =========================================================================
   * SECTION 2: PLAIN TEXT TEMPLATE TESTS
   * =========================================================================
   */
  describe('getWelcomeEmailText', () => {
    it('should return a string', () => {
      const result = getWelcomeEmailText(defaultData);
      expect(typeof result).toBe('string');
    });

    it('should include the user first name', () => {
      const result = getWelcomeEmailText(defaultData);
      expect(result).toContain('Hugo');
    });

    it('should include the app name', () => {
      const result = getWelcomeEmailText(defaultData);
      expect(result).toContain('Claude Demo');
    });

    it('should include welcome message', () => {
      const result = getWelcomeEmailText(defaultData);
      expect(result).toContain('¡Bienvenido');
    });

    it('should include copyright notice', () => {
      const result = getWelcomeEmailText(defaultData);
      expect(result).toContain('© 2026');
    });

    it('should NOT include HTML tags', () => {
      const result = getWelcomeEmailText(defaultData);
      expect(result).not.toContain('<html');
      expect(result).not.toContain('<body');
      expect(result).not.toContain('<div');
      expect(result).not.toContain('<table');
    });

    it('should handle special characters in firstName', () => {
      const dataWithSpecialChars: WelcomeEmailData = {
        ...defaultData,
        firstName: 'José María',
      };
      const result = getWelcomeEmailText(dataWithSpecialChars);
      expect(result).toContain('José María');
    });

    it('should include account creation confirmation', () => {
      const result = getWelcomeEmailText(defaultData);
      expect(result).toContain('cuenta ha sido creada exitosamente');
    });
  });

  /**
   * =========================================================================
   * SECTION 3: CONSISTENCY TESTS
   * =========================================================================
   */
  describe('template consistency', () => {
    it('should have matching content between HTML and text versions', () => {
      const html = getWelcomeEmailHtml(defaultData);
      const text = getWelcomeEmailText(defaultData);

      // Both should contain the same key information
      expect(html).toContain(defaultData.firstName);
      expect(text).toContain(defaultData.firstName);

      expect(html).toContain(defaultData.appName);
      expect(text).toContain(defaultData.appName);
    });

    it('should handle empty firstName gracefully', () => {
      const dataWithEmptyName: WelcomeEmailData = {
        ...defaultData,
        firstName: '',
      };

      const html = getWelcomeEmailHtml(dataWithEmptyName);
      const text = getWelcomeEmailText(dataWithEmptyName);

      // Should not throw and should still contain app name
      expect(html).toContain(defaultData.appName);
      expect(text).toContain(defaultData.appName);
    });

    it('should handle long firstName', () => {
      const dataWithLongName: WelcomeEmailData = {
        ...defaultData,
        firstName: 'A'.repeat(100),
      };

      const html = getWelcomeEmailHtml(dataWithLongName);
      const text = getWelcomeEmailText(dataWithLongName);

      expect(html).toContain('A'.repeat(100));
      expect(text).toContain('A'.repeat(100));
    });
  });
});
