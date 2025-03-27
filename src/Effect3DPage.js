import React from 'react';
import styled from 'styled-components';
import Effect3D from './Effect3D';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #181818;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Effect3DPage = () => {
  return (
    <PageContainer>
      <ContentContainer>
        <Effect3D {...{
          frontText: "G",
          backText: "R",
          canvasSize: 400,                    // 画布大小
          canvasBackground: "#000000",        // 画布背景色
          fontSize: 200,                      // 文字大小
          fontFamily: "Arial Black",          // 文字字体
          rotationSpeed: 0.005,              // 旋转速度
          particleScaleSpeed: 5,             // 粒子缩放速度
          particleMinScale: 0.5,             // 粒子最小缩放
          particleMaxScale: 1.5,             // 粒子最大缩放
          particleColor: 0xffffff,           // 粒子颜色
          particleGap: 12,                    // 粒子间隔
        }} />
      </ContentContainer>
    </PageContainer>
  );
};

export default Effect3DPage; 