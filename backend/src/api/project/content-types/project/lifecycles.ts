export default {
  beforeCreate(event) {
    const { data } = event.params;

    // 1. isBasicShow 최초 생성 시 기본값(true) 설정
    if (data.isBasicShow === undefined || data.isBasicShow === null) {
      data.isBasicShow = true;
    }

    // 2. teamType 기본값 설정
    // (Strapi는 Relation 필드가 빈 상태로 저장될 때 빈 객체 {connect:[], ...} 를 보내므로 
    // 단순 if(!data.company) 검사로 teamType을 null로 강제화하면 사용자가 선택한 값이 날아가는 버그가 생깁니다.
    // 회사가 선택되더라도 teamType 값을 보존하도록 수정했습니다.)
    if (!data.teamType) {
      data.teamType = 'Team';
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;

    // 1. isBasicShow 기존 등록 사항 업데이트 시 명시적으로 null/빈값이면 true 강제
    if (data.isBasicShow === null) {
      data.isBasicShow = true;
    }

    // 2. 명시적으로 teamType이 빈 값으로 오면 기본값 'Team' 강제
    if (data.teamType === null || data.teamType === '') {
      data.teamType = 'Team';
    }
  },
};
