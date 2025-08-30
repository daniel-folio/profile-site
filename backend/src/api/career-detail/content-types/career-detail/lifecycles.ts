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
  // 프로젝트 조회 시 strapi.db.query 사용
  const project = await strapi.db.query('api::project.project').findOne({
    where: { id: projectId },
    populate: ['company']
  });
  
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
  
  // 회사 조회 시 strapi.db.query 사용
  const company = await strapi.db.query('api::company.company').findOne({
    where: { id: companyId }
  });
  data.companyName = company?.company || null;
} 