export default {
  beforeCreate(event) {
    const { data } = event.params;

    // 1. isBasicShow 최초 생성 시 기본값(true) 설정
    if (data.isBasicShow === undefined || data.isBasicShow === null) {
      data.isBasicShow = true;
    }

    // 2. 회사 선택 여부에 따른 teamType 설정 로직
    if (!data.company) {
      // 회사가 선택되지 않은 상태에서 teamType이 비어있으면 기본값 'Team'
      if (!data.teamType) {
        data.teamType = 'Team';
      }
    } else {
      // 회사가 선택된 상태라면 teamType은 무의미하므로 null 초기화
      // (Admin UI에서 값을 선택하더라도 저장 시 지워지도록 강제)
      data.teamType = null;
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;

    // 1. isBasicShow 기존 등록 사항 업데이트 시 명시적으로 null/빈값이면 true 강제
    if (data.isBasicShow === null) {
      data.isBasicShow = true;
    }

    // 2. 회사 연결/해제에 따른 teamType 업데이트
    // 업데이트 페이로드에 company 정보가 올 경우만 처리
    if ('company' in data) {
      if (!data.company) {
        // 회사를 해제했을 때 teamType이 없다면 기본값 'Team'
        if (!data.teamType) {
          data.teamType = 'Team';
        }
      } else {
        // 회사를 선택했을 때는 teamType 무효화
        data.teamType = null;
      }
    }
  },
};
