import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useChangeEvent, useModal, useServerAPI } from '../../../hooks';
import { ResultMessage } from '../../../hooks/useServerAPI';
import { RootState } from '../../../store';
import { FullVerticalCenterBox, ScrollBox } from '../../../styles/shared';
import { ILineRes, ISectionReq, IStationRes } from '../../../type';
import { Button, Header, Select } from '../../atoms';
import { IOption } from '../../atoms/Select/Select';
import { ListItem, Modal, SectionAddForm } from '../../molecules';
import { SelectContainer } from './Section.styles';

const lineApiResponseMessage: ResultMessage = {
  ['GET_ALL_DATA_RESPONSE']: {
    fail: '노선 조회에 실패하였습니다.',
    success: '',
  },
};

const sectionApiResponseMessage: ResultMessage = {
  ['POST_DATA_RESPONSE']: {
    fail: '구간 추가에 실패하셨습니다.',
    success: '구간 추가에 성공하셨습니다.',
  },
  ['DELETE_RESPONSE']: {
    fail: '구간 삭제에 실패하셨습니다.',
    success: '구간 삭제에 성공하셨습니다.',
  },
};

const Section = () => {
  const { close: closeModal, open: openModal, isModalOpen, onClickClose } = useModal(false);
  const {
    hostState: { host },
  } = useSelector((state: RootState) => {
    return { hostState: state.hostReducer };
  });

  const { allData: stations, getAllData: getAllStations } = useServerAPI<IStationRes>(
    `${host}/stations`,
    sectionApiResponseMessage,
  );

  const {
    allData: lines,
    getAllData: getAllLines,
    deleteData: deleteSection,
    deleteDataResponse: deleteSectionResponse,
    postData: addSection,
    postDataResponse: addSectionResponse,
  } = useServerAPI<ILineRes>(`${host}/lines`, lineApiResponseMessage);

  const { value: lineId, onChange: onChangeLineId } = useChangeEvent('');
  const {
    value: distance,
    onChange: onChangeDistance,
    setValue: setDistance,
  } = useChangeEvent('1');
  const {
    value: upStationId,
    onChange: onChangeUpStationId,
    setValue: setUpStationId,
  } = useChangeEvent('');
  const {
    value: downStationId,
    onChange: onChangeDownStationId,
    setValue: setDownStationId,
  } = useChangeEvent('');

  const resetForm = () => {
    setDistance('1');
    setUpStationId('');
    setDownStationId('');
  };

  const lineOptions: IOption[] = lines?.map(({ id, name }) => ({ value: id, name })) || [];

  const displayStations: IStationRes[] =
    lines?.find(({ id }) => id === Number(lineId))?.stations || [];

  const onSubmitSectionInfo: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (upStationId === '' || downStationId === '') {
      window.alert('상행선, 하행선을 선택해주세요');

      return;
    }

    if (upStationId === downStationId) {
      window.alert('상행선, 하행선은 달라야 합니다');

      return;
    }

    const body: ISectionReq = {
      upStationId: Number(upStationId),
      downStationId: Number(downStationId),
      distance: Number(distance),
    };

    addSection<ISectionReq>(body, `${lineId}/sections`);

    resetForm();
    closeModal();
  };

  const onDeleteSection = (stationId: number) => {
    if (!confirm('해당 구간을 정말로 삭제하시겠습니까?')) return;

    deleteSection(`${lineId}/sections?stationId=${stationId}`);
  };

  useEffect(() => {
    getAllLines();
  }, [addSectionResponse, deleteSectionResponse]);

  useEffect(() => {
    getAllStations();
    getAllLines();
  }, []);

  return (
    <FullVerticalCenterBox>
      <Header hasExtra>
        <h3>🚉 구간 관리</h3>
        <Button onClick={openModal}>구간 추가</Button>
      </Header>
      <SelectContainer>
        <Select
          options={lineOptions}
          onChange={onChangeLineId}
          selectValue={lineId}
          defaultName="노선을 선택해주세요"
        />
      </SelectContainer>

      <ScrollBox>
        {displayStations.map(({ id: stationId, name }) => {
          return (
            <ListItem
              key={stationId}
              content={name}
              onClickDelete={() => {
                onDeleteSection(stationId);
              }}
            />
          );
        })}
      </ScrollBox>

      {isModalOpen && (
        <Modal onClickClose={onClickClose}>
          <Header>
            <h3>{'🔁 구간 추가'}</h3>
          </Header>
          <SectionAddForm
            stationList={stations || []}
            lineList={lines || []}
            lineId={Number(lineId)}
            onChangeLine={onChangeLineId}
            onChangeUpStation={onChangeUpStationId}
            upStation={Number(upStationId)}
            onChangeDownStation={onChangeDownStationId}
            downStation={Number(downStationId)}
            onChangeDistance={onChangeDistance}
            distance={Number(distance)}
            onSubmitSectionInfo={onSubmitSectionInfo}
          />
        </Modal>
      )}
    </FullVerticalCenterBox>
  );
};

export default Section;
