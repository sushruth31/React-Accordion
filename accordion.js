import { useContext, useState, useRef, useEffect, forwardRef } from "react";
import { useFetchwStore } from "./useFetchwStore";
import { rootserverurl } from "./rooturl";
import { SideBarContext } from "./sidebarcontext";
import { MotionButton } from "./motionbutton";
import axios from "axios";
import { DataStoreContext } from "../datastore";
import useLongPress from "./useLongPress";
import useWindowClick from "./useWindowClick";

export default function MgmtAccordion({ heading }) {
  const [openissue, setOpenIssue] = useState();
  const { axiosheaders } = useContext(DataStoreContext);
  const { mgmtconsiderations, setMgmtConsiderations } = useContext(SideBarContext);
  const [_, loading, err] = useFetchwStore(
    yourapiurl,
    mgmtconsiderations,
    setMgmtConsiderations,
    [heading],
    false
  );

  const [isOptionsOpen, setIsOptionsOpen] = useState();

  const [isnewissue, setIsNewIssue] = useState(false);
  const [isIssueEdited, setIsIssueEdited] = useState();

  useWindowClick(() => {
    if (isIssueEdited) setIsIssueEdited();
  });

  const actionOptionsRef = useRef();

  useWindowClick(() => {
    if (isnewissue) setIsNewIssue(false);
  });

  useWindowClick(() => {
    if (isOptionsOpen) setIsOptionsOpen();
  }, [actionOptionsRef]);

  const handleDeleteAction = (e, id) => {
    e.stopPropagation();

    const statecopy = [...mgmtconsiderations];

    const arrindex = statecopy.findIndex(({ level2 }) => level2.some(el => el._id == id));

    const newlevel2 = statecopy[arrindex].level2.filter(el => el._id !== id);

    const newhighlevelel = { level1: statecopy[arrindex].level1, level2: newlevel2 };

    setMgmtConsiderations(prevstate => {
      const newstate = [...prevstate];
      newstate[arrindex] = newhighlevelel;
      return newstate;
    });

    axios.request({
      method: "GET",
      url: yourapiurl,
      params: { id: id },
      ...axiosheaders,
    });
  };

  const newissueref = useRef();

  const handleNewIssueSubmit = async e => {
    e.preventDefault();
    const inputtext = newissueref.current.value;
    const statecopy = [...mgmtconsiderations];
    const headingcaps = heading
      .split("")
      .map(ltr => ltr.toUpperCase())
      .join("");

    const res = await axios.request({
      method: "GET",
      url: yourapiurl,
      params: { heading: heading, issue: inputtext },
      ...axiosheaders,
    });
    const { data: resid } = res;

    const newlevel1 = { _heading: headingcaps, _id: resid, _issue: inputtext };

    statecopy.push({ level1: newlevel1, level2: [] });

    setMgmtConsiderations(statecopy);

    newissueref.current.value = "";
    setIsNewIssue();
  };

  const editactionref = useRef();

  useWindowClick(() => {
    if (isActionEdited) setIsActionEdited();
  }, [editactionref]);

  const [isActionEdited, setIsActionEdited] = useState();

  const MgmtListItem = forwardRef(({ _issue, level2, _id, turnIssueEditOff }, editactionref) => {
    const editIssueRef = useRef();
    const newactionref = useRef();
    const [isnewaction, setIsNewAction] = useState();

    const getEditValue = level2id => {
      const statecopy = [...mgmtconsiderations];
      const arrindex = statecopy.findIndex(({ level2 }) => level2.some(el => el._id == level2id));
      return statecopy[arrindex].level2.filter(({ _id }) => _id === level2id)[0]._action;
    };

    const handleEditSubmit = async (e, level2id) => {
      e.preventDefault();

      const statecopy = [...mgmtconsiderations];
      const index = statecopy.findIndex(({ level2 }) => level2.some(({ _id }) => _id === level2id));

      const newlevel2 = statecopy[index].level2.map(el =>
        el._id === level2id ? { _action: editactionref.current.value, _id: level2id, link: el._link } : el
      );

      const newhighlevelel = { level1: statecopy[index].level1, level2: newlevel2 };

      setMgmtConsiderations(prevstate => {
        const newstate = [...prevstate];
        newstate[index] = newhighlevelel;
        return newstate;
      });

      const res = await axios.request({
        method: "GET",
        url: yourapiurl,
        params: { id: level2id, action: editactionref.current.value, link: "" },
        ...axiosheaders,
      });

      setIsActionEdited();
    };

    const handleNewActionSubmit = async (e, issue) => {
      e.preventDefault();

      if (!newactionref.current.value) return;

      const res = await axios.request({
        method: "GET",
        url: yourapiurl,
        params: { heading: heading, issue: issue, action: newactionref.current.value, link: "" },
        ...axiosheaders,
      });

      const { data: resid } = res;

      const arrindex = [...mgmtconsiderations].findIndex(
        ({ level1: { _heading, _issue } }) =>
          _heading.toUpperCase() === heading.toUpperCase() && _issue.toUpperCase() === issue.toUpperCase()
      );

      const newlevel2 = [
        ...[...mgmtconsiderations][arrindex].level2,
        { _id: resid, _action: newactionref.current.value, _link: "" },
      ];
      const newhighlevelel = { level1: [...mgmtconsiderations][arrindex].level1, level2: newlevel2 };

      setMgmtConsiderations(prevstate => {
        const newstate = [...prevstate];
        newstate[arrindex] = newhighlevelel;
        return newstate;
      });

      setIsNewAction(false);
    };

    useWindowClick(() => {
      if (isnewaction) setIsNewAction(false);
    }, [newactionref]);

    useWindowClick(() => {
      if (isIssueEdited) turnIssueEditOff();
    }, [editIssueRef]);

    const longpressactions = useLongPress(() => {
      setOpenIssue();
      setIsIssueEdited(_id);
    });

    useEffect(() => {
      editIssueRef?.current?.focus();
    }, [isIssueEdited]);

    const handleEditIssue = e => {
      e.preventDefault();

      const inputtext = editIssueRef.current.value;
      const statecopy = [...mgmtconsiderations];

      const index = statecopy.findIndex(
        ({ level1: { _id: inputid, _heading } }) => inputid == _id && _heading.toUpperCase() === heading.toUpperCase()
      );

      if (inputtext) {
        const newlevel1 = { ...statecopy[index]?.level1, _issue: inputtext };
        const newhighlevelel = { level1: newlevel1, level2: statecopy[index]?.level2 };

        setMgmtConsiderations(prevstate => {
          const newstate = [...prevstate];
          newstate[index] = newhighlevelel;

          return newstate;
        });

        axios.request({
          method: "GET",
          url: yourapiurl,
          params: { id: _id, issue: inputtext },
          ...axiosheaders,
        });

        editIssueRef.current.value = "";

        setIsIssueEdited();
      } else {
        handleDeleteIssue(statecopy, index);
      }
    };

    const handleDeleteIssue = (statecopy, index) => {
      setMgmtConsiderations(statecopy.filter((_, idx) => idx !== index));
      axios.request({
        url: yourapiurl,
        params: { id: _id },
        method: `GET`,
        ...axiosheaders,
      });
    };

    useEffect(() => {
      if (editIssueRef?.current) editIssueRef.current.value = _issue;
    }, [isIssueEdited]);

    useEffect(() => {
      if (newactionref?.current) newactionref.current.focus();
    }, [isnewaction]);

    useEffect(() => {
      if (editactionref?.current) editactionref.current.focus();
    }, [isActionEdited]);

    return (
      <div
        {...longpressactions}
        onClick={() => {
          openissue === _issue ? setOpenIssue("") : setOpenIssue(_issue);
          setIsIssueEdited();
        }}
        className="accordion-item">
        {isIssueEdited === _id ? (
          <form className="flex" onSubmit={e => handleEditIssue(e)}>
            <input
              onClick={e => e.stopPropagation()}
              ref={node => (editIssueRef.current = node)}
              className="mgmtnewactioninput form-control"
              placeholder="Edit Issue"
            />
          </form>
        ) : (
          <h2 class="accordion-header">
            <button
              class={openissue === _issue ? "accordion-button expand" : "accordion-button collapsed"}
              type="button">
              {_issue}
            </button>
          </h2>
        )}
        <div class={openissue === _issue ? "accordion-collapse expand" : "accordion-collapse collapse"}>
          <div class="accordion-body">
            <ul className="list-group-flush">
              {level2.map(({ _action, _link, _id }) => (
                <>
                  {isOptionsOpen === _id && (
                    <div ref={actionOptionsRef} className="mgmtchildlistexpand">
                      <ul className="list-group-flush">
                        <li
                          key={_id}
                          onClick={e => {
                            e.stopPropagation();
                            setIsActionEdited(_id);
                            setIsOptionsOpen();
                          }}
                          className="mgmtsublistli cursor list-group-item">
                          Edit
                        </li>
                        <li onClick={e => handleDeleteAction(e, _id)} className="mgmtsublistli cursor list-group-item">
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                  {isActionEdited === _id ? (
                    <form className="flex" onSubmit={e => handleEditSubmit(e, _id)}>
                      <input
                        ref={node => (editactionref.current = node)}
                        defaultValue={getEditValue(_id)}
                        className="mgmtnewactioninput form-control"
                        onClick={e => e.stopPropagation()}
                      />
                    </form>
                  ) : (
                    <li
                      onClick={e => e.stopPropagation()}
                      key={_id}
                      className="flex list-group-item mgmtconsiderationsli">
                      <div className="actionandlink">
                        <div>{_action}</div>
                        <div>{_link && _link}</div>
                      </div>
                      <span
                        onClick={e => {
                          e.stopPropagation();
                          setIsOptionsOpen(prevstate => (prevstate === _id ? null : _id));
                        }}
                        class="cursor material-icons">
                        more_vert
                      </span>
                    </li>
                  )}
                </>
              ))}
              {isnewaction && (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleNewActionSubmit(e, _issue);
                  }}>
                  <input
                    ref={node => (newactionref.current = node)}
                    placeholder="Enter new action"
                    className={"mgmtnewactioninput form-control"}
                    onClick={e => e.stopPropagation()}
                  />
                </form>
              )}
            </ul>
            {!isnewaction && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setIsNewAction(true);
                }}
                className="btn">
                Add New Action
              </button>
            )}
          </div>
        </div>
      </div>
    );
  });

  useEffect(() => {
    if (newissueref?.current) newissueref.current.focus();
  }, [isnewissue]);

  return (
    <div className="mgmtaccountslist">
      <div className="flex">
        <div className="mgmtaccountslisttitle">
          <div className>Management Considerations</div>
          <div className="mgmtaccordioninstructions normalweight">Press and hold to edit an issue</div>
        </div>
        <MotionButton
          onClick={e => {
            setIsNewIssue(prevstate => !prevstate);
            setOpenIssue();
          }}
          className="btn newsiteicon">
          {!isnewissue ? (
            <span class="material-icons-outlined newsiteiconchild">add</span>
          ) : (
            <div className="mgmtcancelbtntext">Cancel</div>
          )}
        </MotionButton>
      </div>
      <div className="accordion accordion-flush">
        {loading || mgmtconsiderations?.length === 0 ? (
          <div>Loading...</div>
        ) : (
          mgmtconsiderations
            .filter(({ level1: { _heading } }) => _heading.toUpperCase() === heading.toUpperCase())
            .map(({ level1: { _issue, _id }, level2 }) => (
              <MgmtListItem
                turnIssueEditOff={isIssueEdited => setIsIssueEdited(isIssueEdited)}
                _id={_id}
                key={_id}
                _issue={_issue}
                ref={editactionref}
                level2={level2}
              />
            ))
        )}
        {isnewissue && (
          <form onSubmit={e => handleNewIssueSubmit(e)}>
            <input
              ref={node => (newissueref.current = node)}
              placeholder="Enter new issue"
              className="mgmtnewactioninput form-control"
            />
          </form>
        )}
      </div>
    </div>
  );
}
