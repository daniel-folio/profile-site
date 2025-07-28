export default {
  async beforeCreate(event) {
    await setCompanyName(event);
  },
  async beforeUpdate(event) {
    await setCompanyName(event);
  },
};

async function setCompanyName(event) {
  const { data } = event.params;

  let projectId = null;
  if (data.project && typeof data.project === 'object') {
    if ('id' in data.project) {
      projectId = data.project.id;
    } else if ('connect' in data.project && data.project.connect) {
      if (Array.isArray(data.project.connect) && data.project.connect.length > 0) {
        projectId = data.project.connect[0].id;
      } else if (typeof data.project.connect === 'object' && data.project.connect.id) {
        projectId = data.project.connect.id;
      }
    }
  } else if (typeof data.project === 'number' || typeof data.project === 'string') {
    projectId = data.project;
  }
  if (!projectId) {
    return;
  }
  const project = await strapi.entityService.findOne('api::project.project', projectId, { populate: ['company'] }) as any;
  
  if (!project || !project.company) {
    data.companyName = null;
    return;
  }
  let companyId = null;
  if (typeof project.company === 'object' && project.company.id) {
    companyId = project.company.id;
  } else if (typeof project.company === 'number' || typeof project.company === 'string') {
    companyId = project.company;
  }
  if (!companyId) {
    data.companyName = null;
    return;
  }
  const company = await strapi.entityService.findOne('api::company.company', companyId) as any;
  data.companyName = company && company.company ? company.company : null;
} 