interface ResponseGuideProps {
  riskScore: number;
}

export function ResponseGuide({ riskScore }: ResponseGuideProps) {
  void riskScore; // reserved for future conditional content
  return (
    <div className="bg-white rounded-2xl border-2 border-red-200 p-6 space-y-6">
      <h3 className="text-xl font-bold text-red-800">즉시 해야 할 일</h3>

      <div className="space-y-5">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700 text-lg">
            1
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 mb-1">절대 추가 입금하지 마세요</p>
            <p className="text-base text-slate-600 leading-relaxed">
              "세금", "보증금", "수수료" 명목으로 추가 입금을 요구한다면 이미 전형적인 사기 수법입니다. 어떤 이유로도 추가 송금은 금지입니다.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700 text-lg">
            2
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 mb-1">개인정보 보호</p>
            <p className="text-base text-slate-600 leading-relaxed">
              해당 사이트와 같은 비밀번호를 쓰는 모든 사이트의 비밀번호를 즉시 변경하세요.
              네이버·카카오·구글·금융앱 등 모든 중요 계정을 확인하세요.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700 text-lg">
            3
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 mb-1">계좌 지급정지 신청</p>
            <p className="text-base text-slate-600 leading-relaxed">
              돈을 보내신 은행에 즉시 전화하여 <strong>"전기통신금융사기 피해금 환급 특별법"</strong>에 따른 지급정지를 신청하세요.
              신청 후 금융감독원(<strong><a href="tel:1332" className="underline">1332</a></strong>)에 피해 접수하시면 됩니다.
            </p>
            <p className="text-base text-slate-500 leading-relaxed mt-2">
              사건 내용에 따라서 지급정지를 은행에서 진행해주지 않는 경우도 있습니다.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700 text-lg">
            4
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 mb-2">신고하기</p>
            <div className="space-y-2">
              <a href="tel:182" className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <span className="text-xl" aria-hidden="true">🚔</span>
                <div>
                  <p className="text-base font-semibold text-slate-800">경찰청 사이버범죄 신고</p>
                  <p className="text-base text-blue-700 font-bold">182</p>
                </div>
              </a>
              <a href="tel:1332" className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <span className="text-xl" aria-hidden="true">📞</span>
                <div>
                  <p className="text-base font-semibold text-slate-800">금융감독원 피해 상담</p>
                  <p className="text-base text-blue-700 font-bold">1332</p>
                </div>
              </a>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <span className="text-xl" aria-hidden="true">💻</span>
                <div>
                  <p className="text-base font-semibold text-slate-800">사이버범죄 온라인 신고</p>
                  <p className="text-sm text-slate-500">ecrm.cyber.go.kr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-base text-amber-900 leading-relaxed">
        <strong>중요:</strong> 피해를 입으셨다면 혼자 해결하려 하지 마세요. 전문가 혹은 전문 기관에 즉시 상담한후, 신고하면 피해 회복 가능성이 높아집니다.
      </div>
    </div>
  );
}
