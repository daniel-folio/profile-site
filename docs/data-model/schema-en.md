# 🎛️ Backend Data Model & Settings

### Overview
The site settings system provides centralized configuration management through Strapi Admin Panel. All settings are dynamically applied without requiring code changes or server restarts, enabling real-time site management.

### Available Settings

#### **🔐 adminPassword (Administrator Password)**
- **Description**: Admin authentication password for visitor analytics dashboard access
- **Type**: String (Plain text, 6-50 characters)
- **Default**: Set during initial setup
- **Usage**: Authentication for `/admin/visitors` page access
- **Security**: Visible as plain text in Strapi Admin (due to UI limitations)
- **Best Practice**: Use strong passwords and restrict Strapi Admin access

#### **📊 enableVisitorTracking (Visitor Tracking Toggle)**
- **Description**: Enable or disable visitor data collection and analytics system
- **Type**: Boolean
- **Default**: `true` (enabled)
- **Effect**: When set to `false`, immediately stops all visitor tracking and data collection
- **Application**: Applied in real-time without server restart
- **Privacy**: Respects user privacy preferences and GDPR compliance

#### **🏷️ siteName (Site Title)**
- **Description**: Site title displayed in browser tabs, meta tags, and social media shares
- **Type**: String (maximum 100 characters)
- **Default**: "Developer Portfolio"
- **Usage**: SEO optimization, browser tab titles, social media previews
- **Impact**: Affects search engine rankings and user experience

#### **📝 siteDescription (Site Meta Description)**
- **Description**: SEO meta description for search engines and social media
- **Type**: Text (maximum 500 characters)
- **Default**: "Personal portfolio website"
- **Usage**: Google search results, social media share descriptions
- **SEO**: Critical for search engine optimization and click-through rates

#### **🌐 siteUsed (Site Accessibility Control)**
- **Description**: Master switch for site accessibility (`true` = accessible, `false` = blocked)
- **Type**: Boolean
- **Default**: `true` (accessible)
- **Effect**: When `false`, displays maintenance screen to all visitors
- **Use Cases**: Site maintenance, updates, emergency blocking
- **Warning**: Blocks admin access as well when disabled

#### **👥 maxVisitorsPerDay (Daily Visitor Limit)**
- **Description**: Daily visitor limit for traffic control and server load management
- **Type**: Integer (range: 100 - 1,000,000)
- **Default**: 10,000
- **Purpose**: Server load management, traffic monitoring, resource optimization
- **Implementation**: Used for analytics and potential rate limiting

### Configuration Guide

1. **Access Strapi Admin Panel**
   ```
   http://localhost:1337/admin
   ```

2. **Navigate to Settings**
   - Go to **Content Manager** → **Site Settings**
   - Select the single Site Settings entry

3. **Update Configuration Values**
   - Modify any setting values as needed
   - Use the built-in validation for data types
   - Click **Save** to apply changes immediately

4. **Real-time Application**
   - Changes are applied immediately without server restart
   - Frontend reflects new settings on next page load or API call
   - No deployment required for configuration changes

### Core Content Types

Beyond site settings, the following models define the core portfolio data. For detailed field descriptions, refer to the [Strapi Admin Guide](../guide/strapi-admin-guide-en.md).

#### **📂 Project**
- **Key Fields**: `isBasicShow` (Default visibility), `teamType` (Team/Personal category), `order` (Display order)
- **Logic**: N:1 relationship with `Company`. Features automatic categorization based on affiliation or project nature.

#### **📂 Company (Career)**
- **Key Fields**: `companyName`, `isBasicShow` (Default visibility), `order` (Display order)
- **Logic**: Defines the main career section on the resume and can contain nested projects.

#### **📂 Skill**
- **Key Fields**: `isPublic` (Resume visibility), `visible` (Home visibility), `category`

---

### Advanced Configuration


#### **Environment-Specific Settings**
- **Development**: Use test values for safe development
- **Production**: Implement strong security measures
- **Staging**: Mirror production settings for accurate testing

#### **Security Considerations**
- **Password Management**: Use password managers for strong passwords
- **Access Control**: Limit Strapi Admin access to authorized personnel
- **Regular Updates**: Change passwords periodically (every 3-6 months)
- **Monitoring**: Track failed login attempts and unusual access patterns

#### **Performance Optimization**
- **Visitor Tracking**: Monitor impact on server performance
- **Cache Management**: Settings are cached for optimal performance
- **Database Optimization**: Regular cleanup of old visitor data recommended
